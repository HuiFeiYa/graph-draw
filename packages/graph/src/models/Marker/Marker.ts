import { Shape } from "@hfdraw/types"
import { getUid } from "../../util/common"
import { pathBuilder } from "../../util/PathBuilder"

/**
 * 一个标亮效果
 */
export class Marker {
  id = getUid()
  targetShape:Shape|null

  strokeColor:string
  strokeWidth:number

  visible =false

  // svgPath=""

  type?:string // marker的类型，用于批量移除某一类的marker

  /** 移动间隔速率 */
  speedSm = 100;

  /** 当前状态类型 RUNNING 表示动画进行时 */
  statusType = '';

  /** 当前marker显示气泡文案 */
  tip = '';

  /** 是否反方向运行动画 */
  reverse = false;

  constructor(targetShape:Shape|null, strokeColor:string, strokeWidth = 2, visible = true) {
    this.targetShape = targetShape;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
    this.visible = visible;
  }
  /**
   * 不允许单独调用，必须在markerManager里调用，需要同时维护modelIdToMarkers索引
   * @param shape
   */
  setTargetShape(shape:Shape) {
	  this.targetShape = shape;

  }

  setStrokeColor(color:string) {
	  this.strokeColor = color;
  }

  setStrokeWidth(width:number) {
    this.strokeWidth = width;
  }
  setVisible(visible:boolean) {
    this.visible = visible;
  }

  setType(type:string) {
    this.type = type;
  }

  setStatusType(statusType:string) {
    this.statusType = statusType;
  }

  setSpeedSm(speedSm:number) {
    this.speedSm = speedSm;
  }

  setTip(tip:string) {
    this.tip = tip;
  }

  getSvgPath() {
    const waypoint = this.targetShape?.waypoint;
    if (waypoint?.length) {
      const points = this.reverse ? [...waypoint].reverse() : waypoint;

      pathBuilder.clear();
      const firstPoint = points[0];
      pathBuilder.MoveTo(firstPoint.x, firstPoint.y);
      points.forEach((pt, index) => {
        if (index === 0) return;
        pathBuilder.LineTo(pt.x, pt.y);

      });
      return pathBuilder.getPath();
    } else {
      return '';
    }
  }

  // 显示点位
  pointVisible() {
    const visible = this.visible && (this.statusType === 'ACTIVE');
    return visible;
  }

  // 获取点位移动间隔
  getSpeedView() {
    if (!this.pointVisible()) {
      return '0ms';
    }
    return `${this.speedSm}ms`;
  }
}