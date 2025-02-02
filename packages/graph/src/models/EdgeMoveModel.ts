import { Bounds, EdgeShape, IPoint, ShapeType } from "@hfdraw/types"
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

    dx = 0 // 移动的x距离
    dy = 0 // 移动的y距离

    showPreview = false // 是否显示预览
    previewPath = '' // 预览线的路径path的d属性
    index: MovePointPosition = MovePointPosition.start
    constructor(public graph: GraphModel) {
        this.initPreviewState();
    }

    // 当鼠标按下线段始末的控制点时触发
    onEdgeStartOrEndPointMousedown(event: MouseEvent, edgeShape: EdgeShape, index: MovePointPosition) {
        if (!edgeShape) return 
        this.index = index;
        const absPoint = this.graph.viewModel.translateClientPointToDiagramAbsPoint(new Point(event.clientX, event.clientY));
        const waypoint = edgeShape.waypoint || [];
        this.startPoint = waypoint[0];
        this.endPoint = waypoint[waypoint.length - 1];
        const element:PlaitElement  = {
            source: {
                connection: edgeShape.style.sourceConnection as PointOfRectangle
            },
            target: {
                connection: edgeShape.style.targetConnection as PointOfRectangle
            }
        }

        // if (index === MovePointPosition.start) {
        //     this.startPoint = absPoint;
        //     element.target = {
        //         ...element.target,
        //         connection: edgeShape.style.sourceConnection as PointOfRectangle
        //     }
        // } else if (index === MovePointPosition.end) {
        //     this.endPoint = absPoint;
        //     element.source = {
        //         ...element.source,
        //         connection: edgeShape.style.targetConnection as PointOfRectangle
        //     }
        // }
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
        
        const p = getKeyPoints(sourceRect, targetRect, element)
        this.previewPath = waypointUtil.getPointsPath(p);
        this.showPreview = true;
        console.log('this.previewPath:',this.previewPath)
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