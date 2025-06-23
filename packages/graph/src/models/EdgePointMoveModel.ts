// 线的控制点移动时的模型

import { Point, toIntPoint } from "../util/Point";
import { GraphModel } from "./GraphModel";
import { EdgeMoveType, EdgeShape, EventType, IPoint, MarkerColor, Shape, ShapeKey, ShapeType, SubShapeType } from "@hfdraw/types";
import { Marker } from "./Marker/Marker";
import { generateSmartRoute } from "@hfdraw/elbow";
import { cleanWaypoint, getBoundsCenterPoint, getEdgeGridNum, getGridWaypoints, int } from "../util/common";
export class EdgePointMoveModel {

  movingShape: EdgeShape|undefined = undefined;
  startPoint:IPoint = new Point() // 移动起始时的鼠标的坐标
  endPoint:IPoint = new Point() // 移动过程中鼠标的坐标
  dx=0 // 移动的x距离
  dy=0 // 移动的y距离
  showPreview= false // 是否显示预览

  previewWaypoint:IPoint[] = [] // 预览线的路径点

  previewPath='' // 预览线的路径path的d属性

  moveType:EdgeMoveType|undefined = undefined // 移动类型

  movePointIndex = -1 // 移动的点是第几个点 从0开始
  validConnect = true // 是否为合法元素
  previewControlPointIndex = -1 // 在预览线中的移动的点是第几个

  originControlPoint :IPoint|undefined = undefined // 控制点的初始位置 originPreControlPoint，originNextControlPoint，controlPoint，preControlPoint，nextControlPoint
  originPreControlPoint:IPoint|undefined = undefined
  originNextControlPoint:IPoint|undefined = undefined

  controlPoint:IPoint|undefined = undefined; // 预览线的被拖动的控制点
  preControlPoint:IPoint|undefined = undefined; // 预览线的被拖动的控制点 的 前一个控制点
  nextControlPoint:IPoint|undefined = undefined;// 预览线的被拖动的控制点 的 后一个控制点

  isSecondWayPoint=false // 被拖动的控制点是否为第2个waypoint， 此点被拖动时与source的连线需要额外处理
  isSecondLastWayPoint=false // 被拖动的控制点是否为倒数第2个waypoint此点被拖动时与target的连线需要额外处理

  isPreLineVertical = false
  isNextLineVertical = false
  movingOriginWayPoint:IPoint[] = [] // 原始waypoint线路
  moved=false
  marker?:Marker
  isValidTargetCache:Record<string, 'loading'|boolean|undefined>={}
  sourceShape?: Shape
  targetShape?: Shape
  hoverShape?:Shape
  constructor(public graph:GraphModel) {

  }
  /** 是否为中间路径点 */
  get isWaypoint() {
    return this.moveType === EdgeMoveType.Waypoint;
  }
  get isSourcePoint() {
    return this.moveType === EdgeMoveType.SourcePoint;
  }
  // 鼠标按下线段的转折点时触发（即按下selectionVertex）
  onEdgePointMouseDown(event:MouseEvent, shape:EdgeShape, index:number) {

    if (shape.shapeType !== ShapeType.Edge) return;
    this.startMoveEdgePoint(event, shape, index);
  }
  startMoveEdgePoint(event:MouseEvent, shape:EdgeShape, index:number) {
    this.initPreviewState();
    this.movingShape = shape;
    this.movingOriginWayPoint = shape.waypoint.map((n) => { return new Point(n.x, n.y); });
    this.movePointIndex = index;
    if (index === 0) {
      this.moveType = EdgeMoveType.SourcePoint;
    } else if (index === this.movingShape.waypoint.length - 1) {
      this.moveType = EdgeMoveType.TargetPoint;
    } else {
      this.moveType = EdgeMoveType.Waypoint;
    }
    // const isMovePoint = this.moveType == EdgeMoveType.SourcePoint || this.moveType == EdgeMoveType.TargetPoint;
    // if (isMovePoint ) {
    //   return;
    // }

    // const absPoint = tanslateClientPointToDiagramAbsPoint(new Point(event.clientX, event.clientY ), this.graph.viewModel.viewDom as HTMLDivElement);
    // this.startPoint = absPoint;
    // this.endPoint = absPoint.clone();
    if (this.movingShape.waypoint.length) {
      if (index === 1) {
        this.isSecondWayPoint = true;
      }
      if (index === this.movingShape.waypoint.length - 2) {
        this.isSecondLastWayPoint = true;
      }
    }
    // 直角折线
    // if ( this.isWaypoint) {
    //   const points = this.movingShape.waypoint;
    //   this.originControlPoint = points[index];
    //   this.originPreControlPoint = points[index - 1];
    //   this.originNextControlPoint = points[index + 1];

    //   this.isPreLineVertical = this.originPreControlPoint.x === this.originControlPoint.x;
    //   this.isNextLineVertical = this.originControlPoint.x === this.originNextControlPoint.x;

    //   this.previewWaypoint = points.map(p => ({ ...p }));

    //   this.previewControlPointIndex = index;
    //   if (this.isSecondWayPoint) {
    //     this.previewWaypoint.unshift({ ...this.previewWaypoint[0] });
    //     this.previewControlPointIndex++;
    //   }
    //   if (this.isSecondLastWayPoint) {
    //     this.previewWaypoint.push({ ...this.previewWaypoint[this.previewWaypoint.length - 1] });
    //   // previewControlPointIndex++;
    //   }
    //   this.controlPoint = this.previewWaypoint[this.previewControlPointIndex];
    //   this.preControlPoint = this.previewWaypoint[this.previewControlPointIndex - 1];
    //   this.nextControlPoint = this.previewWaypoint[this.previewControlPointIndex + 1];

    // // 普通折线
    // } 
    const startPoint = this.graph.viewModel.translateClientPointToDiagramAbsPoint(new Point(event.clientX, event.clientY));
    this.startPoint = startPoint;
    this.endPoint = startPoint.clone();

    this.dx = 0;
    this.dy = 0;
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
  initPreviewState() {
    this.showPreview = false;
    this.startPoint = new Point();
    this.endPoint = new Point();
    this.dx = 0;
    this.dy = 0;
    this.previewWaypoint = [];

    this.previewPath = '';
    this.movePointIndex = -1;
    this.previewControlPointIndex = -1; // 在预览线中的移动的点是第几个
    this.originControlPoint = new Point();
    this.originPreControlPoint = new Point();
    this.originNextControlPoint = new Point();
    this.controlPoint = new Point();
    this.preControlPoint = new Point();
    this.nextControlPoint = new Point();
    this.isSecondWayPoint = false;
    this.isSecondLastWayPoint = false;
    this.isPreLineVertical = false;
    this.isNextLineVertical = false;
    this.movingOriginWayPoint = [];
    this.moved = false;

    this.showPreview = false;
    this.validConnect = true;
    this.removeMarker();
    this.sourceShape = undefined;
    this.targetShape = undefined;
    this.hoverShape = undefined;
  }
  removeMarker() {
    if (this.marker) {
      this.graph.markerModel.removeMarker(this.marker.id);
      this.marker = undefined;
    }
  }
  async changeRelationship(event:MouseEvent, edgeShape:EdgeShape, shape?: Shape) {
    const curPoint = this.graph.viewModel.translateClientPointToDiagramAbsPoint(new Point(event.clientX, event.clientY), this.graph.viewModel.viewDom as HTMLDivElement);
    // 当前悬浮的元素
    const curShape = shape;
    this.hoverShape = curShape;
    let waypoints: Point[] = [];
    // 拖拽起点
    if (this.isSourcePoint) {
      const targetShape = this.graph.getShape(edgeShape.targetId);
      const bounds = targetShape?.bounds;
      const point = new Point(bounds?.absX, bounds?.absY);
      this.sourceShape = curShape;
      this.targetShape = targetShape;
      this.validConnect = curShape ? await this.validateConnectShape(curShape) : false;
      if (curShape) {
        // 此方法使用于从 source 连接值 target，如果拖拽的是 source，则需要将计算的点反转下
        waypoints = generateSmartRoute(curPoint, point, 10).map(([x, y]) => new Point(x, y))
        // waypoints = waypointUtil.generateConnectPreviewWaypoint(
        //   this.graph.shapeMap,
        //   edgeShape.style,
        //   targetShape,
        //   curPoint,
        //   curShape
        // );
        waypoints.reverse();
      } else {
        // waypoints = waypointUtil.generateConnectPreviewWaypoint(
        //   this.graph.shapeMap,
        //   edgeShape.style,
        //   curShape,
        //   point,
        //   targetShape,
        //   curPoint
        // );
        waypoints = generateSmartRoute(point, curPoint, 10).map(([x, y]) => new Point(x, y))
      }
    } else {
      this.sourceShape = this.graph.getShape(edgeShape.sourceId);
      this.targetShape = curShape;
      const bounds = curShape?.bounds;
      const point = new Point(bounds?.absX, bounds?.absY);
      const valid = curShape ? await this.validateConnectShape(curShape) : false;
      this.validConnect = valid;
      waypoints = generateSmartRoute(curPoint, point, 10).map(([x, y]) => new Point(x, y))
      // waypoints = waypointUtil.generateConnectPreviewWaypoint(
      //   this.graph.shapeMap,
      //   edgeShape.style,
      //   this.graph.getShape(edgeShape.sourceId),
      //   curPoint,
      //   this.targetShape
      // );
    }
    cleanWaypoint(waypoints, true);
    getGridWaypoints(waypoints, true);
    this.previewWaypoint = waypoints;
    // 未产生有效连接时
    if (!this.sourceShape || !this.targetShape) {
      this.removeMarker();
      this.isValidTargetCache = {};
    }
  }
  async onMouseMove(event:MouseEvent, shape?: Shape) {

    this.endPoint = this.graph.viewModel.translateClientPointToDiagramAbsPoint(new Point(event.clientX, event.clientY));

    this.moved = true;
    this.dx = this.endPoint.x - this.startPoint.x;
    this.dy = this.endPoint.y - this.startPoint.y;
    const edgeShape = this.movingShape;
    if (!edgeShape) return;
    // 判断是否为合法移动目标
    if (!this.isWaypoint) {
      this.changeRelationship(event, edgeShape, shape);
    } else {
      this.validConnect = true;
      if (edgeShape.style.rightAngle) {
        this.adjustPreviewPointsForRightAngle();
      } else {
        this.adjustPreviewPointsForPolly();
      }
    }

    this.updatePreviewPath();

    // this.graph.viewModel.autoScroll(event.clientX, event.clientY, () => this.onMouseMove(event, this.graph.rootShape));

  }
  /**
   * 判断是否为可连接目标，如果是则显示蓝框，否则显示红框
   * @param shape
   * @returns boolean
   */
  async validateConnectShape(shape?: Shape) {
    let valid = false;
    // 排除连线连接自己
    if (this.movingShape?.id === shape?.id) return false;
    if (shape) {
      const { id } = shape;
      let status = this.isValidTargetCache[id];
      if (status !== undefined) {
        if (status === 'loading') {
          return valid;
        } else {
          valid = status;
          if (!this.marker) {
            this.marker = new Marker(shape, 'blue', 2);
            this.graph.markerModel.addMarker(this.marker);
          }
          this.graph.markerModel.setTargetShape(this.marker, shape);

          // this.marker.setTargetShape(shape);
          this.marker.setVisible(true);
          if (valid) {
            this.marker.setStrokeColor(MarkerColor.valid);
          } else {
            if (shape.shapeType === ShapeType.Diagram) {
              this.marker.setVisible(false);
            } else {
              this.marker.setStrokeColor(MarkerColor.invalid);
            }

          }

        }
      } else {
        this.marker?.setVisible(false);
        this.isValidTargetCache[id] = 'loading';
        valid = await this.isValidConnect();
        this.isValidTargetCache[id] = valid;
      }
    } else {
      this.marker?.setVisible(false);
    }
    return valid;
  }
  /**
   * 校验是否为合法目标
   * @returns
   */
  async isValidConnect() {
    return true;
    // if (this.sourceShape && this.targetShape && this.movingShape?.shapeKey) {
    //   const valid = await this.graph.graphOption.isValidConnectTarget?.(this.movingShape.shapeKey, this.sourceShape, this.targetShape);
    //   return !!valid;
    // } else {
    //   return false;
    // }
  }
  adjustPreviewPointsForPolly() {
    if (!this.controlPoint || !this.originControlPoint) return;
    this.controlPoint.x = this.originControlPoint.x + this.dx;
    this.controlPoint.y = this.originControlPoint.y + this.dy;
    this.controlPoint.x = getEdgeGridNum(this.controlPoint.x);
    this.controlPoint.y = getEdgeGridNum(this.controlPoint.y);
  }
  adjustPreviewPointsForRightAngle() {
    if (!this.controlPoint || !this.originControlPoint || !this.preControlPoint || !this.nextControlPoint || !this.movingShape) {

      return;
    }
    this.controlPoint.x = this.originControlPoint.x + this.dx;
    this.controlPoint.y = this.originControlPoint.y + this.dy;

    this.controlPoint.x = getEdgeGridNum(this.controlPoint.x);
    this.controlPoint.y = getEdgeGridNum(this.controlPoint.y);

    // 前一段的调整
    if (this.isSecondWayPoint) { // 如果是第2个waypoint则需要调整起点位置

      const sourceShape = this.graph.getShape(this.movingShape.sourceId);
      if (sourceShape) {
        let sourceBounds = sourceShape.bounds;
        let sourceCenter = getBoundsCenterPoint(sourceBounds);

        if (sourceShape.shapeType === ShapeType.Edge) {
          sourceCenter = new Point(this.movingShape.waypoint[0].x, this.movingShape.waypoint[0].y);
          sourceBounds = { absX: sourceCenter.x, absY: sourceCenter.y, width: 0, height: 0, x: 0, y: 0 };
        }
        const sourcePoint = this.previewWaypoint[0];
        if (this.isPreLineVertical) { // 竖线
          if (this.controlPoint.x < sourceBounds.absX) { // 左侧

            if (this.controlPoint.y > sourceBounds.absY && this.controlPoint.y < sourceBounds.absY + sourceBounds.height) { // 中央
              this.preControlPoint.x = this.controlPoint.x;
              this.preControlPoint.y = this.controlPoint.y;
              sourcePoint.x = sourceBounds.absX;
              sourcePoint.y = this.controlPoint.y;

            } else { // 左上方或左下方
              this.preControlPoint.x = this.controlPoint.x;
              this.preControlPoint.y = sourceCenter.y;
              sourcePoint.x = sourceBounds.absX;
              sourcePoint.y = sourceCenter.y;

            }
          } else if (this.controlPoint.x <= sourceBounds.absX + sourceBounds.width) { // 中央
            if (this.controlPoint.y > sourceBounds.absY && this.controlPoint.y < sourceBounds.absY + sourceBounds.height) { // 中央
              sourcePoint.x = this.movingShape.waypoint[0].x;
              sourcePoint.y = this.movingShape.waypoint[0].y;
              this.preControlPoint.x = this.controlPoint.x;
              this.preControlPoint.y = sourcePoint.y;

            } else if (this.controlPoint.y <= sourceBounds.absY) {
              sourcePoint.x = this.controlPoint.x;
              sourcePoint.y = sourceBounds.absY;
              this.preControlPoint.x = sourcePoint.x;
              this.preControlPoint.y = sourcePoint.y;
            } else {
              sourcePoint.x = this.controlPoint.x;
              sourcePoint.y = sourceBounds.absY + sourceBounds.height;
              this.preControlPoint.x = sourcePoint.x;
              this.preControlPoint.y = sourcePoint.y;
            }
          } else { // 右侧
            if (this.controlPoint.y > sourceBounds.absY && this.controlPoint.y < sourceBounds.absY + sourceBounds.height) { // 中央
              this.preControlPoint.x = sourceBounds.absX + sourceBounds.width; //  this.controlPoint.x;
              this.preControlPoint.y = this.controlPoint.y;
              sourcePoint.x = this.preControlPoint.x;
              sourcePoint.y = this.preControlPoint.y;

            } else { // 左上方或左下方
              this.preControlPoint.x = this.controlPoint.x;
              this.preControlPoint.y = sourceCenter.y;
              sourcePoint.x = sourceBounds.absX + sourceBounds.width;
              sourcePoint.y = sourceCenter.y;

            }
          }

        } else { // 横线
          if (this.controlPoint.x < sourceBounds.absX) { // 左侧
            if (this.controlPoint.y >= sourceBounds.absY && this.controlPoint.y <= sourceBounds.absY + sourceBounds.height) { // 中央
              sourcePoint.x = sourceBounds.absX;
              sourcePoint.y = this.controlPoint.y;
              this.preControlPoint.x = sourcePoint.x;
              this.preControlPoint.y = sourcePoint.y;
            } else if (this.controlPoint.y < sourceBounds.absY) { // 上方
              sourcePoint.x = sourceCenter.x;
              sourcePoint.y = sourceBounds.absY;
              this.preControlPoint.x = sourcePoint.x;
              this.preControlPoint.y = this.controlPoint.y;
            } else { // 下方
              sourcePoint.x = sourceCenter.x;
              sourcePoint.y = sourceBounds.absY + sourceBounds.height;
              this.preControlPoint.x = sourcePoint.x;
              this.preControlPoint.y = this.controlPoint.y;
            }
          } else if (this.controlPoint.x <= sourceBounds.absX + sourceBounds.width) { // 中央
            if (this.controlPoint.y > sourceBounds.absY && this.controlPoint.y < sourceBounds.absY + sourceBounds.height) { // 中央
              sourcePoint.x = this.movingShape.waypoint[0].x;
              sourcePoint.y = this.movingShape.waypoint[0].y;
              this.preControlPoint.x = sourcePoint.x;
              this.preControlPoint.y = this.controlPoint.y;

            } else if (this.controlPoint.y <= sourceBounds.absY) {
              sourcePoint.x = this.controlPoint.x;
              sourcePoint.y = sourceBounds.absY;
              this.preControlPoint.x = sourcePoint.x;
              this.preControlPoint.y = sourcePoint.y;
            } else {
              sourcePoint.x = this.controlPoint.x;
              sourcePoint.y = sourceBounds.absY + sourceBounds.height;
              this.preControlPoint.x = sourcePoint.x;
              this.preControlPoint.y = sourcePoint.y;
            }
          } else { // 右侧
            if (this.controlPoint.y >= sourceBounds.absY && this.controlPoint.y <= sourceBounds.absY + sourceBounds.height) { // 中央
              this.preControlPoint.x = sourceBounds.absX + sourceBounds.width; //  this.controlPoint.x;
              this.preControlPoint.y = this.controlPoint.y;
              sourcePoint.x = this.preControlPoint.x;
              sourcePoint.y = this.preControlPoint.y;

            } else if (this.controlPoint.y < sourceBounds.absY) { // 右上方
              sourcePoint.x = sourceCenter.x;
              sourcePoint.y = sourceBounds.absY;
              this.preControlPoint.x = sourcePoint.x;
              this.preControlPoint.y = this.controlPoint.y;

            } else {
              sourcePoint.x = sourceCenter.x;
              sourcePoint.y = sourceBounds.absY + sourceBounds.height;
              this.preControlPoint.x = sourcePoint.x;
              this.preControlPoint.y = this.controlPoint.y;
            }
          }
        }

      } else { //
        if (this.isPreLineVertical) { // 如果前一段是竖线则更改x坐标

          this.preControlPoint.x = this.controlPoint.x;

        } else { // 如果前一段是横线则更改y坐标
          this.preControlPoint.y = this.controlPoint.y;
        }

      }

    } else {
      if (this.isPreLineVertical) { // 如果前一段是竖线则更改x坐标
        this.preControlPoint.x = this.controlPoint.x;

      } else { // 如果前一段是横线则更改y坐标
        this.preControlPoint.y = this.controlPoint.y;
      }
      // this.preControlPoint;
    }

    // 后一段的调整
    if (this.isSecondLastWayPoint) {

      const targetShape = this.graph.getShape(this.movingShape.targetId);
      if (targetShape) {
        let targetBounds = targetShape.bounds;
        let targetCenter = getBoundsCenterPoint(targetBounds);

        if (targetShape.shapeType === ShapeType.Edge) {
          const lastPoint = this.movingShape.waypoint[this.movingShape.waypoint.length - 1]
          targetCenter = new Point(lastPoint.x, lastPoint.y);
          targetBounds = { absX: targetCenter.x, absY: targetCenter.y, width: 0, height: 0, x: 0, y: 0 };
        }
        const targetPoint = this.previewWaypoint[ this.previewWaypoint.length - 1];
        if (this.isNextLineVertical) { // 竖线
          if (this.controlPoint.x < targetBounds.absX) { // 左侧

            if (this.controlPoint.y > targetBounds.absY && this.controlPoint.y < targetBounds.absY + targetBounds.height) { // 中央
              this.nextControlPoint.x = this.controlPoint.x;
              this.nextControlPoint.y = this.controlPoint.y;
              targetPoint.x = targetBounds.absX;
              targetPoint.y = this.controlPoint.y;

            } else { // 左上方或左下方

              this.nextControlPoint.x = this.controlPoint.x;
              this.nextControlPoint.y = targetCenter.y;
              targetPoint.x = targetBounds.absX;
              targetPoint.y = targetCenter.y;

            }
          } else if (this.controlPoint.x <= targetBounds.absX + targetBounds.width) { // 中央
            if (this.controlPoint.y > targetBounds.absY && this.controlPoint.y < targetBounds.absY + targetBounds.height) { // 中央
              targetPoint.x = this.movingShape.waypoint[this.movingShape.waypoint.length - 1].x;
              targetPoint.y = this.movingShape.waypoint[this.movingShape.waypoint.length - 1].y;
              this.nextControlPoint.x = this.controlPoint.x;
              this.nextControlPoint.y = targetPoint.y;

            } else if (this.controlPoint.y <= targetBounds.absY) {
              targetPoint.x = this.controlPoint.x;
              targetPoint.y = targetBounds.absY;
              this.nextControlPoint.x = targetPoint.x;
              this.nextControlPoint.y = targetPoint.y;
            } else {
              targetPoint.x = this.controlPoint.x;
              targetPoint.y = targetBounds.absY + targetBounds.height;
              this.nextControlPoint.x = targetPoint.x;
              this.nextControlPoint.y = targetPoint.y;
            }
          } else { // 右侧
            if (this.controlPoint.y > targetBounds.absY && this.controlPoint.y < targetBounds.absY + targetBounds.height) { // 中央
              this.nextControlPoint.x = targetBounds.absX + targetBounds.width; //  this.controlPoint.x;
              this.nextControlPoint.y = this.controlPoint.y;
              targetPoint.x = this.nextControlPoint.x;
              targetPoint.y = this.nextControlPoint.y;

            } else { // 左上方或左下方
              this.nextControlPoint.x = this.controlPoint.x;
              this.nextControlPoint.y = targetCenter.y;
              targetPoint.x = targetBounds.absX + targetBounds.width;
              targetPoint.y = targetCenter.y;

            }
          }

        } else { // 横线
          if (this.controlPoint.x < targetBounds.absX) { // 左侧
            if (this.controlPoint.y >= targetBounds.absY && this.controlPoint.y <= targetBounds.absY + targetBounds.height) { // 中央
              targetPoint.x = targetBounds.absX;
              targetPoint.y = this.controlPoint.y;
              this.nextControlPoint.x = targetPoint.x;
              this.nextControlPoint.y = targetPoint.y;
            } else if (this.controlPoint.y < targetBounds.absY) { // 上方
              targetPoint.x = targetCenter.x;
              targetPoint.y = targetBounds.absY;
              this.nextControlPoint.x = targetPoint.x;
              this.nextControlPoint.y = this.controlPoint.y;
            } else { // 下方
              targetPoint.x = targetCenter.x;
              targetPoint.y = targetBounds.absY + targetBounds.height;
              this.nextControlPoint.x = targetPoint.x;
              this.nextControlPoint.y = this.controlPoint.y;
            }
          } else if (this.controlPoint.x <= targetBounds.absX + targetBounds.width) { // 中央
            if (this.controlPoint.y > targetBounds.absY && this.controlPoint.y < targetBounds.absY + targetBounds.height) { // 中央
              targetPoint.x = this.movingShape.waypoint[this.movingShape.waypoint.length - 1].x;
              targetPoint.y = this.movingShape.waypoint[this.movingShape.waypoint.length - 1].y;
              this.nextControlPoint.x = targetPoint.x;
              this.nextControlPoint.y = this.controlPoint.y;

            } else if (this.controlPoint.y <= targetBounds.absY) {
              targetPoint.x = this.controlPoint.x;
              targetPoint.y = targetBounds.absY;
              this.nextControlPoint.x = targetPoint.x;
              this.nextControlPoint.y = targetPoint.y;
            } else {
              targetPoint.x = this.controlPoint.x;
              targetPoint.y = targetBounds.absY + targetBounds.height;
              this.nextControlPoint.x = targetPoint.x;
              this.nextControlPoint.y = targetPoint.y;
            }
          } else { // 右侧
            if (this.controlPoint.y >= targetBounds.absY && this.controlPoint.y <= targetBounds.absY + targetBounds.height) { // 中央
              this.nextControlPoint.x = targetBounds.absX + targetBounds.width; //  this.controlPoint.x;
              this.nextControlPoint.y = this.controlPoint.y;
              targetPoint.x = this.nextControlPoint.x;
              targetPoint.y = this.nextControlPoint.y;

            } else if (this.controlPoint.y < targetBounds.absY) { // 右上方
              targetPoint.x = targetCenter.x;
              targetPoint.y = targetBounds.absY;
              this.nextControlPoint.x = targetPoint.x;
              this.nextControlPoint.y = this.controlPoint.y;

            } else {
              targetPoint.x = targetCenter.x;
              targetPoint.y = targetBounds.absY + targetBounds.height;
              this.nextControlPoint.x = targetPoint.x;
              this.nextControlPoint.y = this.controlPoint.y;
            }
          }
        }

      } else { //
        if (this.isPreLineVertical) { // 如果前一段是竖线则更改x坐标

          this.preControlPoint.x = this.controlPoint.x;

        } else { // 如果前一段是横线则更改y坐标
          this.preControlPoint.y = this.controlPoint.y;
        }

      }
    } else {
      if (this.isNextLineVertical) { // 如果前一段是竖线则更改x坐标
        this.nextControlPoint.x = this.controlPoint.x;

      } else { // 如果前一段是横线则更改y坐标
        this.nextControlPoint.y = this.controlPoint.y;
      }
    }

  }
  updatePreviewPath() {
    let points = this.previewWaypoint;
    if (!this.moved) {
      points = this.movingShape?.waypoint || [];
    }
    if (!points?.length) {
      this.previewPath = '';
      return;
    }

    let path = `M ${int(points[0].x)} ${int(points[0].y)}`;
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      path += (' L ' + int(p.x) + ' ' + int(p.y));
    }
    this.previewPath = path;
  }
  async endMove() {
    if (!this.movingShape) {
      console.error('缺失 movingShape');
      this.initPreviewState();

      return;
    }
    console.log("endMove", this.isWaypoint);
    const points = this.previewWaypoint.map(p => toIntPoint({ ...p }));// [...this.previewWaypoint];
    // const shapeMap = {
    //   [EdgeMoveType.TargetPoint]: this.targetShape,
    //   [EdgeMoveType.SourcePoint]: this.sourceShape,
    //   [EdgeMoveType.Waypoint]: { id: '' }
    // };
    // 移动的是起点或终点
    if (this.moveType === EdgeMoveType.TargetPoint || this.moveType === EdgeMoveType.SourcePoint) {
      const hoverShapeId = this.hoverShape?.id;
      if (!hoverShapeId || this.isValidTargetCache[hoverShapeId] !== true) {
        this.initPreviewState();
        return;
      } else {
        if (this.graph.graphOption.changeRelationshipEnds && this.sourceShape?.id && this.targetShape?.id) {
          try {
          /** 需要先更新 shape 属性，后续再更新 waypoint，否则其中读取的 shape 的属性可能时错误的 */
            await this.graph.graphOption.changeRelationshipEnds(this.movingShape, this.sourceShape, this.targetShape, points, this.moveType);
          } catch (error:any) {
            console.error(error?.message);
          }
          this.initPreviewState();
        }
      }

    // 移动中间控制点
    } 
    // else if (this.moveType === EdgeMoveType.Waypoint) {
    //   if (this.graph.graphOption.customEndMoveEdge) {
    //     this.graph.graphOption.customEndMoveEdge(this.movingShape, points).then(() => {
    //       this.graph.selectionModel.setSelection([this.movingShape as Shape]);
    //     }).finally(() => {
    //       this.initPreviewState();
    //     });
    //   }

    // }
     else {
      console.log('moveType的值不是合法的索引2');
    }
  }

}