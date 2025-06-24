import { Bounds, EdgeShape, ElbowPoint, EventType, IPoint, Shape, ShapeType } from "@hfdraw/types"
import { Point } from "../util/Point"
import { GraphModel } from "./GraphModel"
import { MovePointPosition } from "../types"
import { generateSmartRoute, getKeyPoints, generateRectConnectRoute } from "@hfdraw/elbow"
import { PlaitElement, PointOfRectangle, RectConnectPoint } from "@hfdraw/elbow/util/common-type"
import { waypointUtil } from "@hfdraw/utils"

export class EdgeMoveModel {
    movingShape?: EdgeShape // 正在移动的线的shape
    startPoint: IPoint = new Point() // 移动起始时的鼠标的坐标
    endPoint: IPoint = new Point() // 移动过程中鼠标的坐标
    currentPoint: IPoint = new Point() // 移动过程中鼠标的坐标
    edgeShape!: EdgeShape
    dx = 0 // 移动的x距离
    dy = 0 // 移动的y距离
    waypoint!: [number, number][]
    showPreview = false // 是否显示预览
    previewPath = '' // 预览线的路径path的d属性
    index: MovePointPosition = MovePointPosition.start
    element!:PlaitElement
    get isStart() {
        return this.index === MovePointPosition.start;
    }
    constructor(public graph: GraphModel) {
        this.initPreviewState();
    }
    getEdgeParams() {
        const edgeShape = this.edgeShape;
        const element:PlaitElement  = {
            source: {
                connection: (edgeShape.style.sourceConnection || [1,0.5]) as PointOfRectangle
            },
            target: {
                connection: (edgeShape.style.targetConnection || [0, 0.5]) as PointOfRectangle
            }
        }
        const sourceElement = this.graph.shapeMap.get(edgeShape.sourceId);
        const targetElement = this.graph.shapeMap.get(edgeShape.targetId);
        
        // 处理源图形不存在的情况，使用waypoint的起始点生成fake图形
        let sourceBounds: Bounds;
        if (sourceElement?.bounds) {
            sourceBounds = sourceElement.bounds;
        } else {
            // 使用waypoint的第一个点作为fake图形的中心点
            const startPoint = edgeShape.waypoint?.[0] || { x: 0, y: 0 };
            const fakeSize = 10; // fake图形的大小
            sourceBounds = new Bounds(
                startPoint.x - fakeSize / 2,
                startPoint.y - fakeSize / 2,
                fakeSize,
                fakeSize
            );
        }
        
        // 处理目标图形不存在的情况，使用waypoint的终点生成fake图形
        let targetBounds: Bounds;
        if (targetElement?.bounds) {
            targetBounds = targetElement.bounds;
        } else {
            // 使用waypoint的最后一个点作为fake图形的中心点
            const endPoint = edgeShape.waypoint?.[edgeShape.waypoint.length - 1] || { x: 0, y: 0 };
            const fakeSize = 10; // fake图形的大小
            targetBounds = new Bounds(
                endPoint.x - fakeSize / 2,
                endPoint.y - fakeSize / 2,
                fakeSize,
                fakeSize
            );
        }
        
        const sourceRect: PointOfRectangle[] = [
            [sourceBounds.x, sourceBounds.y],
            [sourceBounds.x + sourceBounds.width, sourceBounds.y + sourceBounds.height]
        ]
        const targetRect: PointOfRectangle[] = [
            [targetBounds.x, targetBounds.y],
            [targetBounds.x + targetBounds.width, targetBounds.y + targetBounds.height]
        ]
        return {
            element,
            sourceRect,
            targetRect
        }
    }
    // 当鼠标按下线段始末的控制点时触发
    onEdgeStartOrEndPointMousedown(event: MouseEvent, edgeShape: EdgeShape, index: MovePointPosition) {
        if (!edgeShape) return 
        this.index = index;
        this.edgeShape = edgeShape;
        const absPoint = this.graph.viewModel.translateClientPointToDiagramAbsPoint(new Point(event.clientX, event.clientY));
        const waypoint = edgeShape.waypoint || [];
        this.startPoint = waypoint[0];
        this.endPoint = waypoint[waypoint.length - 1];
        
        // 初始预览路径使用原始起点和终点
        const elbowPath2 = generateSmartRoute(this.startPoint, this.endPoint, 10);
        this.previewPath = waypointUtil.getPointsPath(elbowPath2);
        this.showPreview = true;

        const onMouseMove = this.onMouseMove.bind(this);
        const onMouseUp = () => {
            this.graph.emitter.off(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
            this.graph.emitter.off(EventType.SHAPE_MOUSE_UP, onMouseUp);
            window.removeEventListener('mouseup', onMouseUp); // 如果移动到了画布或窗口之外

            this.endMove();
        };
        this.graph.emitter.on(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
        this.graph.emitter.on(EventType.SHAPE_MOUSE_UP, onMouseUp);
        window.addEventListener('mouseup', onMouseUp);
    }

    onMouseMove(event: MouseEvent, shape?: Shape) {
        // console.log('onMouseMove edgeMoveModel:', shape);
        const currentPoint = this.graph.viewModel.translateClientPointToDiagramAbsPoint(new Point(event.clientX, event.clientY));
        const edgeShape = this.edgeShape;
        if (!edgeShape) return;
        this.currentPoint = currentPoint;
        // 根据移动的端点类型生成预览路径
        if (this.index === MovePointPosition.start) {
            this.generatePreviewForStartPoint(shape);
        } else if (this.index === MovePointPosition.end) {
            this.generatePreviewForEndPoint(shape);
        }
    }

    /**
     * 生成起点移动时的预览路径
     */
    private generatePreviewForStartPoint(shape?: Shape) {
        const sourceRect = this.getSourceRectConnectPoint(shape);
        const targetRect = this.getTargetRectConnectPoint();
        
        
        this.generatePreviewPath(sourceRect, targetRect);
    }

    /**
     * 生成终点移动时的预览路径
     */
    private generatePreviewForEndPoint(shape?: Shape) {
        const sourceRect = this.getSourceRectConnectPoint();
        const targetRect = this.getTargetRectConnectPoint(shape);
        this.generatePreviewPath(sourceRect, targetRect);
    }

    /**
     * 获取源图形的矩形连接点信息
     */
    private getSourceRectConnectPoint(shape?: Shape): RectConnectPoint {
        const edgeShape = this.edgeShape;
        const sourceElement = shape || this.graph.shapeMap.get(edgeShape.sourceId);
        
        if (sourceElement?.bounds) {
            // 有图形时使用左边中点连接
            return {
                bounds: sourceElement.bounds,
                connection: [0, 0.5]
            };
        } else {
            // 无图形时使用waypoint的第一个点作为中心点连接
            const startPoint = this.isStart ?  this.currentPoint : edgeShape.waypoint?.[0] ;
            const fakeSize = 4;
            return {
                bounds: new Bounds(
                    startPoint.x - fakeSize / 2,
                    startPoint.y - fakeSize / 2,
                    fakeSize,
                    fakeSize,
                    startPoint.x - fakeSize / 2,
                    startPoint.y - fakeSize / 2
                ),
                connection: [0.5, 0.5]
            };
        }
    }

    /**
     * 获取目标图形的矩形连接点信息
     */
    private getTargetRectConnectPoint(shape?: Shape): RectConnectPoint {
        const edgeShape = this.edgeShape;
        const targetElement = shape || this.graph.shapeMap.get(edgeShape.targetId);
        
        if (targetElement?.bounds) {
            // 有图形时使用左边中点连接
            return {
                bounds: targetElement.bounds,
                connection: [0, 0.5]
            };
        } else {
            // 无图形时使用waypoint的最后一个点作为中心点连接
            const endPoint = this.isStart ?  edgeShape.waypoint?.[edgeShape.waypoint.length - 1] :this.currentPoint;
            const fakeSize = 4;
            return {
                bounds: new Bounds(
                    endPoint.x - fakeSize / 2,
                    endPoint.y - fakeSize / 2,
                    fakeSize,
                    fakeSize,
                    endPoint.x - fakeSize / 2,
                    endPoint.y - fakeSize / 2
                ),
                connection: [0.5, 0.5]
            };
        }
    }

    /**
     * 使用RectConnectRoute生成预览路径
     */
    private generatePreviewPath(sourceRect: RectConnectPoint, targetRect: RectConnectPoint) {
        try {
            console.log('sourceRect:', JSON.stringify(sourceRect), 'targetRect:', JSON.stringify(targetRect));
            // 使用generateRectConnectRoute生成预览路径
            const previewBounds = generateRectConnectRoute(sourceRect, targetRect, {
                routeType: 'elbow',
                margin: 30
            });
            
            // 将Bounds数组转换为waypoint格式
            const previewWaypoint: [number, number][] = previewBounds.map(bounds => [
                bounds.absX,
                bounds.absY
            ]);
            
            this.previewPath = waypointUtil.getPointsPath(previewWaypoint);
            this.waypoint = previewWaypoint;
            console.log('previewWaypoint:', JSON.stringify(previewWaypoint));
        } catch (error) {
            console.warn('generateRectConnectRoute failed, falling back to simple route:', error);
            // 回退到简单的点对点路径
            this.generateFallbackPath(sourceRect, targetRect);
        }
    }

    /**
     * 回退方案：生成简单的点对点路径
     */
    private generateFallbackPath(sourceRect: RectConnectPoint, targetRect: RectConnectPoint) {
        const startPoint: [number, number] = [
            sourceRect.bounds.absX + sourceRect.bounds.width * sourceRect.connection[0],
            sourceRect.bounds.absY + sourceRect.bounds.height * sourceRect.connection[1]
        ];
        
        const endPoint: [number, number] = [
            targetRect.bounds.absX + targetRect.bounds.width * targetRect.connection[0],
            targetRect.bounds.absY + targetRect.bounds.height * targetRect.connection[1]
        ];
        
        const previewWaypoint = generateSmartRoute(startPoint, endPoint, 10);
        this.previewPath = waypointUtil.getPointsPath(previewWaypoint);
        this.waypoint = previewWaypoint;
    }

    endMove() {
        this.initPreviewState();
        this.graph.graphOption.EdgePointEndMove(this.edgeShape.id, this.waypoint.map(arr => {
            return new Point(arr[0],arr[1]);
        }),{});
    }
    // 鼠标按下线段时触发,在 createEventHandler.ts 中触发事件
    onEdgeMousedown(event: MouseEvent, shape: EdgeShape) {
        if (!shape || shape.shapeType !== ShapeType.Edge) return;
        this.startMoveEdge(event, shape);

    }
    startMoveEdge(event: MouseEvent, shape: EdgeShape) {

        this.initPreviewState();
    }
    initPreviewState() {
        this.showPreview = false;
        this.startPoint = new Point(); // 移动起始时的鼠标的坐标
        this.endPoint = new Point(); // 移动过程中鼠标的坐标

        this.dx = 0;
        this.dy = 0;

        // this.previewWaypoint = [];
        // this.previewWaypointsForShape = [];

        this.previewPath = '';

        // this.segmentIndex = -1;
        // this.previewSegmentIndex = -1;
        // this.isSourceSegment = false;
        // this.isTargetSegment = false;
        // this.isVerticalSegment = false;

        // this.startControlPoint = undefined;
        // this.endControlPoint = undefined;
        // this.originStartControlPoint = undefined;
        // this.originEndControlPoint = undefined;

        // this.pollyControlPoint = undefined;
        // this.originPollyControlPoint = undefined;
        // this.moved = false;
    }
}