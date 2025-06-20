import { Bounds, IPoint } from "@hfdraw/types";
import { ApiCode } from "./constant";
import { cloneDeep } from "lodash";
import { Point } from "./Point";

export function int(num:number|string) {
    return Math.round(+num);
  }

  export enum VertexType {
    leftTop=1,
    rightTop=2,
    rightBottom=3,
    leftBottom=4,
    left=5,
    top=6,
    right=7,
    bottom=8
  }

  export const StrokeColor = 'rgba(21,71,146,0.5)';


  export function equalBounds(bounds1: Bounds, bounds2: Bounds) {
    return bounds1.x === bounds2.x && bounds1.y === bounds2.y && bounds1.width === bounds2.width && bounds1.height === bounds2.height && bounds1.absX === bounds2.absX && bounds1.absY === bounds2.absY;
  }
  export class ResData<T> {
    code = 1000
    message = ''
    data?: T
    title = ''
    constructor(code:ApiCode, data?: T, message?:string) {
      this.data = data;
      this.code = code || ApiCode.SUCCESS;
      this.message = message || 'success';
    }
  }

  let i0 = 1;
export const getUid = () => 'id' + (i0++);

/**
 * 获得斜率
 * @param p1 起点
 * @param p2 终点
 */
export const getB = (p1:IPoint, p2:IPoint) => {
  let b = (p2.y - p1.y) / (p2.x - p1.x);
  if (b === -Infinity) {
    b = Infinity;
  }
  return b;
};

/**
 * 三点是否在同一条线上，角度在10deg范围内
 * @param p1
 * @param p2
 * @param p3
 * @param rate Math.PI / rate 得到的弧度 默认 22.5 即 8deg
 * @returns
 */
export function isOneLine(p1:IPoint, p2:IPoint, p3:IPoint, rate = 22.5) {
  if (rate === 0) {
    if ((p1.x === p2.x && p2.x === p3.x) || (p1.y === p2.y && p2.y === p3.y)) {
      return true;
    } else {
      return false;
    }
  }

  const b1 = getB(p1, p2);
  const b2 = getB(p2, p3);

  if (Math.abs(Math.atan(b1) - Math.atan(b2)) < Math.PI / rate) {

    return true;
  } else return false;

}

/**
 * 清理点位，移除重复的和同一条线的
 * @param waypoints
 */
export function cleanWaypoint(waypoints:IPoint[], modifySelf?:boolean) {
  if (!modifySelf) {
    waypoints = [...waypoints];

  }
  for (let i = 0; i < waypoints.length; i++) {
    if (waypoints.length < 3) {
      break;
    }
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const p3 = waypoints[i + 2];
    if (p2 && p1.x === p2.x && p1.y === p2.y) {
      waypoints.splice(i + 1, 1);
      i--;
      continue;
    }

    if (p2 && p3 && isOneLine(p1, p2, p3, 0)) {
      waypoints.splice(i + 1, 1);
      i--;
    }
  }
  return waypoints;
}
export const EDGE_GRID_SIZE = 4;
export const GRID_SIZE = 8;
export function getGridNum(num:number, gridSize = GRID_SIZE) {
  const yu = num % gridSize;
  if (yu == 0) return num;
  if (yu >= 0) {
    if (yu > 2) {
      num += gridSize - yu;
    } else {
      num -= yu;
    }
  } else {
    if (yu < -2) {
      num -= (gridSize + yu);
    } else {
      num += yu;
    }
  }
  return num;
}
export function getEdgeGridNum(num:number, gridSize = EDGE_GRID_SIZE) {
  return getGridNum(num, gridSize);

}
export function getGridWaypoints(waypoints:IPoint[], modifySelf?:boolean) {
  if (!modifySelf) {
    waypoints = cloneDeep(waypoints);
  }
  waypoints.forEach((pt, index) => {
    // pt.toInt();
    const nextPt = waypoints[index + 1];
    if (nextPt) {
      if (pt.y === nextPt.y) { // 横线处理y坐标为网格
        pt.y = getEdgeGridNum(pt.y);
        nextPt.y = getEdgeGridNum(nextPt.y);

      } else if (pt.x === nextPt.x) { // 竖线处理x坐标为网格
        pt.x = getEdgeGridNum(pt.x);
        nextPt.x = getEdgeGridNum(nextPt.x);
      } else {
        console.log('not found on grid', waypoints);
      }
    }
  });

  return waypoints;
}


export function getBoundsCenterPoint(bounds:Bounds) {
  const x = bounds.absX + bounds.width / 2;
  const y = bounds.absY + bounds.height / 2;
  return new Point(x, y);
}