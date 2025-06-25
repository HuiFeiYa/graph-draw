import {
  Bounds,
  EdgeShape,
  ElbowPoint,
  EventType,
  IPoint,
  Shape,
  ShapeType,
  StyleObject,
} from "@hfdraw/types";
import { Point } from "../util/Point";
import { GraphModel } from "./GraphModel";
import { MovePointPosition } from "../types";
import {
  generateSmartRoute,
  getKeyPoints,
  generateRectConnectRoute,
  getOptimalConnectionPoint,
} from "@hfdraw/elbow";
import {
  PlaitElement,
  PointOfRectangle,
  RectConnectPoint,
} from "@hfdraw/elbow/util/common-type";
import { waypointUtil } from "@hfdraw/utils";

export class EdgeMoveModel {
  movingShape?: EdgeShape; // 正在移动的线的shape
  startPoint: IPoint = new Point(); // 移动起始时的鼠标的坐标
  endPoint: IPoint = new Point(); // 移动过程中鼠标的坐标
  currentPoint: IPoint = new Point(); // 移动过程中鼠标的坐标
  edgeShape!: EdgeShape;
  dx = 0; // 移动的x距离
  dy = 0; // 移动的y距离
  waypoint!: [number, number][];
  showPreview = false; // 是否显示预览
  previewPath = ""; // 预览线的路径path的d属性
  index: MovePointPosition = MovePointPosition.start;
  element!: PlaitElement;
  toUpdateEdgeShapeParams: {
    style?: StyleObject;
    sourceId?: string | null;
    targetId?: string | null;
  } = {}; // 要更新的边的样式
  get isStart() {
    return this.index === MovePointPosition.start;
  }
  constructor(public graph: GraphModel) {
    this.initPreviewState();
  }
  // 当鼠标按下线段始末的控制点时触发
  onEdgeStartOrEndPointMousedown(
    event: MouseEvent,
    edgeShape: EdgeShape,
    index: MovePointPosition
  ) {
    if (!edgeShape) return;
    this.index = index;
    this.edgeShape = edgeShape;
    const waypoint = edgeShape.waypoint || [];
    this.startPoint = waypoint[0];
    this.endPoint = waypoint[waypoint.length - 1];

    // 初始预览路径使用原始起点和终点
    const elbowPath2 = generateSmartRoute(this.startPoint, this.endPoint, 10);
    this.previewPath = waypointUtil.getPointsPath(elbowPath2);
    this.showPreview = true;

    const onMouseMove = this.onMouseMove.bind(this);
    const onMouseUp = () => {
      this.endMove();
      this.graph.emitter.off(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
      this.graph.emitter.off(EventType.SHAPE_MOUSE_UP, onMouseUp);
      window.removeEventListener("mouseup", onMouseUp); // 如果移动到了画布或窗口之外
    };
    this.graph.emitter.on(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
    this.graph.emitter.on(EventType.SHAPE_MOUSE_UP, onMouseUp);
    window.addEventListener("mouseup", onMouseUp);
  }

  onMouseMove(event: MouseEvent, shape?: Shape) {
    // console.log('onMouseMove edgeMoveModel:', shape);
    const currentPoint =
      this.graph.viewModel.translateClientPointToDiagramAbsPoint(
        new Point(event.clientX, event.clientY)
      );
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
    // console.log('sourceRect:', JSON.stringify(sourceRect), 'targetRect:', JSON.stringify(targetRect));
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
    const isStart = this.isStart;
    let sourceElement: Shape | undefined;
    // 无图形时使用waypoint的第一个点作为中心点连接
    let startPoint!: IPoint;
    let connection: [number, number] = [0.5, 0.5];

    const sourceId = edgeShape.sourceId;
    if (isStart) {
      sourceElement = shape;
      startPoint = this.currentPoint;
    } else {
      sourceElement = this.graph.shapeMap.get(sourceId);
      startPoint = edgeShape.waypoint?.[0];
    }
    let retBounds!: Bounds;
    if (sourceElement?.bounds) {
      // 根据当前鼠标位置或起点位置智能确定连接点
      connection =
        sourceElement.style.sourceConnection ||
        getOptimalConnectionPoint(
          startPoint.x,
          startPoint.y,
          sourceElement.bounds.x,
          sourceElement.bounds.y,
          sourceElement.bounds.width,
          sourceElement.bounds.height
        );
      retBounds = sourceElement.bounds;
    } else {
      const fakeSize = 4;
      retBounds = new Bounds(
        startPoint.x - fakeSize / 2,
        startPoint.y - fakeSize / 2,
        fakeSize,
        fakeSize,
        startPoint.x - fakeSize / 2,
        startPoint.y - fakeSize / 2
      );
    }
    if (isStart) {
        if (shape) {
          this.toUpdateEdgeShapeParams = {
            ...this.toUpdateEdgeShapeParams,
            style: {
              ...this.toUpdateEdgeShapeParams.style,
              sourceConnection: connection,
            },
            sourceId: sourceElement?.id,
          };
        } else {
          // 原来有连图形移除时清空关联
          this.toUpdateEdgeShapeParams = {
            ...this.toUpdateEdgeShapeParams,
            style: {
              ...this.toUpdateEdgeShapeParams.style,
              sourceConnection: null,
            },
            sourceId: null,
          };
      }
      console.log('this.toUpdateEdgeShapeParams:', JSON.stringify(this.toUpdateEdgeShapeParams));
    }
    return {
      bounds: retBounds,
      connection,
    };
  }

  /**
   * 获取目标图形的矩形连接点信息
   */
  private getTargetRectConnectPoint(shape?: Shape): RectConnectPoint {
    const edgeShape = this.edgeShape;
    const isStart = this.isStart;
    const targetElement = isStart
      ? this.graph.shapeMap.get(edgeShape.targetId)
      : shape;
    const endPoint = isStart
      ? edgeShape.waypoint?.[edgeShape.waypoint.length - 1]
      : this.currentPoint;

    if (targetElement?.bounds) {
      // 根据当前鼠标位置或起点位置智能确定连接点
      const connection =
        targetElement.style.targetConnection ||
        getOptimalConnectionPoint(
          endPoint.x,
          endPoint.y,
          targetElement.bounds.x,
          targetElement.bounds.y,
          targetElement.bounds.width,
          targetElement.bounds.height
        );
      this.toUpdateEdgeShapeParams = {
        ...this.toUpdateEdgeShapeParams,
        style: {
          ...this.toUpdateEdgeShapeParams.style,
          targetConnection: connection,
        },
        targetId: targetElement.id,
      };
      return {
        bounds: targetElement.bounds,
        connection,
      };
    } else {
      // 当终点移动且没有连接到图形时，需要清除目标连接关系
      if (!isStart) {
        this.toUpdateEdgeShapeParams = {
          ...this.toUpdateEdgeShapeParams,
          style: {
            ...this.toUpdateEdgeShapeParams.style,
            targetConnection: null,
          },
          targetId: null,
        };
      }
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
        connection: [0.5, 0.5],
      };
    }
  }

  /**
   * 使用RectConnectRoute生成预览路径
   */
  private generatePreviewPath(
    sourceRect: RectConnectPoint,
    targetRect: RectConnectPoint
  ) {
    try {
      // console.log('sourceRect:', JSON.stringify(sourceRect), 'targetRect:', JSON.stringify(targetRect));
      // 使用generateRectConnectRoute生成预览路径
      const previewBounds = generateRectConnectRoute(sourceRect, targetRect, {
        routeType: "elbow",
        margin: 30,
      });

      // 将Bounds数组转换为waypoint格式
      const previewWaypoint: [number, number][] = previewBounds.map(
        (bounds) => [bounds.absX, bounds.absY]
      );

      this.previewPath = waypointUtil.getPointsPath(previewWaypoint);
      this.waypoint = previewWaypoint;
      // console.log('previewWaypoint:', JSON.stringify(previewWaypoint));
    } catch (error) {
      console.warn(
        "generateRectConnectRoute failed, falling back to simple route:",
        error
      );
      // 回退到简单的点对点路径
      this.generateFallbackPath(sourceRect, targetRect);
    }
  }

  /**
   * 回退方案：生成简单的点对点路径
   */
  private generateFallbackPath(
    sourceRect: RectConnectPoint,
    targetRect: RectConnectPoint
  ) {
    const startPoint: [number, number] = [
      sourceRect.bounds.absX +
        sourceRect.bounds.width * sourceRect.connection[0],
      sourceRect.bounds.absY +
        sourceRect.bounds.height * sourceRect.connection[1],
    ];

    const endPoint: [number, number] = [
      targetRect.bounds.absX +
        targetRect.bounds.width * targetRect.connection[0],
      targetRect.bounds.absY +
        targetRect.bounds.height * targetRect.connection[1],
    ];

    const previewWaypoint = generateSmartRoute(startPoint, endPoint, 10);
    this.previewPath = waypointUtil.getPointsPath(previewWaypoint);
    this.waypoint = previewWaypoint;
  }

  endMove() {
    const { style, sourceId, targetId } = this.toUpdateEdgeShapeParams;
    console.log(
      "endMove toUpdateEdgeShapeParams:",
      JSON.stringify(this.toUpdateEdgeShapeParams)
    );
    this.graph.graphOption.EdgePointEndMove(
      this.edgeShape.id,
      this.waypoint.map((arr) => {
        return new Point(arr[0], arr[1]);
      }),
      style,
      sourceId,
      targetId
    );
    this.initPreviewState();
  }
  // 鼠标按下线段时触发,在 createEventHandler.ts 中触发事件
  onEdgeMousedown(event: MouseEvent, shape: EdgeShape) {
    if (!shape || shape.shapeType !== ShapeType.Edge) return;
    this.startMoveEdge(event, shape);
  }
  startMoveEdge(event: MouseEvent, shape: EdgeShape) {
    this.initPreviewState();
  }

  // 鼠标按下线段中间点时触发
  onEdgeSegmentMousedown(event: MouseEvent, edgeShape: EdgeShape, segmentIndex: number) {
    if (!edgeShape || edgeShape.shapeType !== ShapeType.Edge) return;
    
    this.edgeShape = edgeShape;
    this.index = segmentIndex;
    const waypoint = edgeShape.waypoint || [];
    this.waypoint = waypoint.map(point => [point.x, point.y]);
    
    const startPoint = this.graph.viewModel.translateClientPointToDiagramAbsPoint(
      new Point(event.clientX, event.clientY)
    );
    this.startPoint = startPoint;
    this.currentPoint = startPoint;
    
    const onMouseMove = this.onSegmentMouseMove.bind(this);
    const onMouseUp = () => {
      this.endSegmentMove();
      this.graph.emitter.off(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
      this.graph.emitter.off(EventType.SHAPE_MOUSE_UP, onMouseUp);
      window.removeEventListener("mouseup", onMouseUp);
    };
    
    this.graph.emitter.on(EventType.SHAPE_MOUSE_MOVE, onMouseMove);
    this.graph.emitter.on(EventType.SHAPE_MOUSE_UP, onMouseUp);
    window.addEventListener("mouseup", onMouseUp);
  }

  // 线段中间点移动过程中的鼠标移动处理
  // todo 变更位置计算
  onSegmentMouseMove(event: MouseEvent) {
    const currentPoint = this.graph.viewModel.translateClientPointToDiagramAbsPoint(
      new Point(event.clientX, event.clientY)
    );
    
    const dx = currentPoint.x - this.startPoint.x;
    const dy = currentPoint.y - this.startPoint.y;
    
    const newWaypoint = [...this.waypoint];
    const waypoints = this.edgeShape.waypoint;
    
    // 确定要移动的线段范围（当前点及其相邻的共线点）
     const segmentPoints = this.getSegmentPoints(this.index, waypoints);
    console.log('segmentPoints:', JSON.stringify(segmentPoints));
    // 判断线段方向并相应地更新坐标
    if (segmentPoints.length > 1) {
      const isHorizontalSegment = this.isHorizontalSegment(segmentPoints, waypoints);
      
      segmentPoints.forEach(pointIndex => {
        if (newWaypoint[pointIndex]) {
          if (isHorizontalSegment) {
            // 水平线段只改变y坐标
            newWaypoint[pointIndex] = [
              waypoints[pointIndex].x,
              waypoints[pointIndex].y + dy
            ];
          } else {
            // 垂直线段只改变x坐标
            newWaypoint[pointIndex] = [
              waypoints[pointIndex].x + dx,
              waypoints[pointIndex].y
            ];
          }
        }
      });
    }
    
    this.waypoint = newWaypoint;
    this.previewPath = waypointUtil.getPointsPath(newWaypoint);
    this.showPreview = true;
  }
  
  // 获取当前线段的所有共线点索引
  private getSegmentPoints(segmentIndex: number, waypoints: IPoint[]): number[] {
    if (segmentIndex <= 0 || segmentIndex >= waypoints.length) {
      return []; // 无效的线段索引
    }
    
    const result: number[] = [];
    // segmentIndex对应的是线段，线段的两个端点是waypoints[segmentIndex-1]和waypoints[segmentIndex]
    const startPoint = waypoints[segmentIndex - 1];
    const endPoint = waypoints[segmentIndex];
    
    // 判断当前线段的方向
    const isHorizontal = startPoint.y === endPoint.y;
    const isVertical = startPoint.x === endPoint.x;
    
    if (!isHorizontal && !isVertical) {
      // 如果不是水平或垂直线段，返回线段的两个端点（排除起点和终点）
      const points = [];
      if (segmentIndex - 1 > 0) points.push(segmentIndex - 1);
      if (segmentIndex < waypoints.length - 1) points.push(segmentIndex);
      return points;
    }
    
    // 向前查找共线的线段
    let startSegmentIndex = segmentIndex;
    while (startSegmentIndex > 1) {
      const prevStart = waypoints[startSegmentIndex - 2];
      const prevEnd = waypoints[startSegmentIndex - 1];
      const sameDirection = isHorizontal ? (prevStart.y === prevEnd.y) : (prevStart.x === prevEnd.x);
      if (sameDirection) {
        startSegmentIndex--;
      } else {
        break;
      }
    }
    
    // 向后查找共线的线段
    let endSegmentIndex = segmentIndex;
    while (endSegmentIndex < waypoints.length - 1) {
      const nextStart = waypoints[endSegmentIndex];
      const nextEnd = waypoints[endSegmentIndex + 1];
      const sameDirection = isHorizontal ? (nextStart.y === nextEnd.y) : (nextStart.x === nextEnd.x);
      if (sameDirection) {
        endSegmentIndex++;
      } else {
        break;
      }
    }
    
    // 收集所有共线线段涉及的中间点（不包括起点和终点）
    for (let i = Math.max(1, startSegmentIndex - 1); i <= Math.min(waypoints.length - 2, endSegmentIndex); i++) {
      result.push(i);
    }
    return result;
  }
  
  private isHorizontalSegment(segmentPoints: number[], waypoints: IPoint[]): boolean {
    if (segmentPoints.length === 0) return false;
  
    // 获取第一个点的 y 坐标作为基准
    const firstY = waypoints[segmentPoints[0]].y;
  
    // 遍历所有点，检查 y 坐标是否相同
    for (const index of segmentPoints) {
      if (waypoints[index].y !== firstY) {
        return false;
      }
    }
  
    return true;
  }

  // 结束线段中间点移动
  endSegmentMove() {
    this.graph.graphOption.moveSegment(
      this.edgeShape.id,
      this.waypoint.map((arr) => new Point(arr[0], arr[1]))
    );
    this.initPreviewState();
  }
  initPreviewState() {
    this.showPreview = false;
    this.startPoint = new Point(); // 移动起始时的鼠标的坐标
    this.endPoint = new Point(); // 移动过程中鼠标的坐标
    this.toUpdateEdgeShapeParams = {};
    this.dx = 0;
    this.dy = 0;
    this.previewPath = "";
  }
}
