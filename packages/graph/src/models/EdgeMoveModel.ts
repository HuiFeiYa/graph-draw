import { Bounds, EdgeShape, EventType, IPoint, ShapeType } from "@hfdraw/types"
import { Point } from "../util/Point"
import { GraphModel } from "./GraphModel"
import { MovePointPosition } from "../types"
import { getKeyPoints } from "@hfdraw/elbow"
import { PlaitElement, PointOfRectangle } from "@hfdraw/elbow/util/common-type"
import { waypointUtil } from "../util/edgeUtil/WaypointUtil"

export class EdgeMoveModel {
    movingShape?: EdgeShape // 正在移动的线的shape
    startPoint: IPoint = new Point() // 移动起始时的鼠标的坐标
    endPoint: IPoint = new Point() // 移动过程中鼠标的坐标
    edgeShape!: EdgeShape
    dx = 0 // 移动的x距离
    dy = 0 // 移动的y距离
    waypoint!: [number, number][]
    showPreview = false // 是否显示预览
    previewPath = '' // 预览线的路径path的d属性
    index: MovePointPosition = MovePointPosition.start
    element!:PlaitElement
    constructor(public graph: GraphModel) {
        this.initPreviewState();
    }
    getEdgeParams() {
        const edgeShape = this.edgeShape;
        const element:PlaitElement  = {
            source: {
                connection: edgeShape.style.sourceConnection as PointOfRectangle
            },
            target: {
                connection: edgeShape.style.targetConnection as PointOfRectangle
            }
        }
        const sourceElement = this.graph.shapeMap.get(edgeShape.sourceId);
        const targetElement = this.graph.shapeMap.get(edgeShape.targetId);
        const sourceBounds = sourceElement?.bounds || new Bounds();
        const targetBounds = targetElement?.bounds || new Bounds();
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
        const { sourceRect, targetRect, element } = this.getEdgeParams();
        const p = getKeyPoints(sourceRect, targetRect, element)
        this.previewPath = waypointUtil.getPointsPath(p);
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

    onMouseMove(event:MouseEvent) {
        const currentPoint = this.graph.viewModel.translateClientPointToDiagramAbsPoint(new Point(event.clientX, event.clientY));
        const edgeShape = this.edgeShape;
        if (!edgeShape) return ;
        let bounds = new Bounds();
        let connection = [0, 0];
        if (this.index === MovePointPosition.start) {
            const sourceElement = this.graph.shapeMap.get(edgeShape.sourceId);
            if (sourceElement) {
                bounds = sourceElement.bounds ;
            }
            if (edgeShape.style.sourceConnection) {
                connection = edgeShape.style.sourceConnection
            }
        } else if (this.index === MovePointPosition.end) {
            const targetElement = this.graph.shapeMap.get(edgeShape.targetId);
            if (targetElement) {
                bounds = targetElement.bounds ;
                if (edgeShape.style.targetConnection) {
                    connection = edgeShape.style.targetConnection
                }
            }
        }
        if (connection[0] === 0 || connection[0] === 1) {
            const yRate = (currentPoint.y - bounds.y) / bounds.height;
            connection[1] = yRate
        }

        if (connection[1] === 0 || connection[1] === 1) {
            const xRate = (currentPoint.x - bounds.x) / bounds.width;
            connection[0] = xRate
        }

        const { sourceRect, targetRect, element } = this.getEdgeParams();
        if (this.index === MovePointPosition.start) {
            element.source.connection = connection as PointOfRectangle;
        } else if (this.index === MovePointPosition.end) {
            element.target.connection = connection as PointOfRectangle;
        }
        const waypoint = getKeyPoints(sourceRect, targetRect, element)
        this.element = element;
        this.previewPath = waypointUtil.getPointsPath(waypoint);
        this.waypoint = waypoint;
    }

    endMove() {
        this.initPreviewState();
        this.graph.graphOption.EdgePointEndMove(this.edgeShape.id, this.waypoint.map(arr => {
            return new Point(arr[0],arr[1]);
        }),{sourceConnection: this.element.source.connection, targetConnection: this.element.target.connection});
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