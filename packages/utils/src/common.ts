import { Bounds, IPoint, Point } from "@hfdraw/types";
import { AreaType } from "./constant";
import { Line } from "./edgeUtil/Line";

export function getBoundsCenterPoint(bounds:Bounds) {
    const x = bounds.absX + bounds.width / 2;
    const y = bounds.absY + bounds.height / 2;
    return new Point(x, y);
  }


  export function getCloseSide(point:Point, bounds:Bounds):AreaType {
    interface IndexToAreaMap {
        [key: number]: AreaType;
      }
    const indexToArea:IndexToAreaMap = {
        0: AreaType.top,
        1: AreaType.right,
        2: AreaType.bottom,
        3: AreaType.left
      };
    const boundsLines = Line.createBoundsSegmentLines(bounds);
    let index = 0;
    let distance = Infinity;
    boundsLines.forEach((line, i) => {
      const dis = line.getDistanceToPoint(point);
      if (dis < distance) {
        distance = dis;
        index = i;
      }
    });
    return indexToArea[index];
  
  }

  export function int(num:number|string) {
    return Math.round(+num);
  }

  export function float(num:number, precision = 2) {
    return parseFloat(num.toFixed(precision));
  }


  /**
 * 获得线与bounds的交点
 * @param line
 * @param bounds
 */
export function getJoinPointBetweenLineAndBounds(line:Line, boundsLines:Line[], multiple = true, ctx?:{indexs:number[]}) {
    let result:Point[] = [];
    let index = 0;
    for (let line1 of boundsLines) {
      const joinPoint = line.getJoinPointWith(line1);
      if (joinPoint) {
        result.push(joinPoint);
        if (ctx) {
          ctx.indexs.push(index);
        }
        if (!multiple) {
          break;
        }
  
      }
      index++;
    }
  
    return result;
  
  }

  export const getPointDistance = (p1:IPoint, p2:IPoint) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  
  };
  export function getClosePoint(sourcePoint:Point, pts:Point[]) {
    if (pts.length <= 1) {
      return pts[0];
    }
    let result:Point = pts[0];
    let distance = Infinity;
    pts.forEach((pt) => {
      const dis = getPointDistance(sourcePoint, pt);
      if (dis < distance) {
        result = pt;
        distance = dis;
      }
    });
    return result;
  }


  export function getBoundsBorderCenterPoint(bounds:Bounds) {
    let center = getBoundsCenterPoint(bounds);
    return {
      top: new Point(center.x, bounds.absY),
      left: new Point(bounds.absX, center.y),
      right: new Point(bounds.absX + bounds.width, center.y),
      bottom: new Point(center.x, bounds.absY + bounds.height),
  
    };
  
  }
  /**
 * 获得bounds的外部中点的十字射线
 * @param bounds
 * @returns
 */
export function getOutCenterRayLines(bounds:Bounds) {
    const pts = getBoundsBorderCenterPoint(bounds);
  
    // const outCenterRayLines:{left:Line, right:Line, top:Line, bottom:Line} = {} as any;
  
    const top = Line.createRayLine(pts.top, new Point(pts.top.x, pts.top.y - 20));
    const bottom = Line.createRayLine(pts.bottom, new Point(pts.bottom.x, pts.bottom.y + 20));
  
    const right = Line.createRayLine(pts.right, new Point(pts.right.x + 20, pts.right.y));
  
    const left = Line.createRayLine(pts.left, new Point(pts.left.x - 20, pts.left.y));
    return [top, right, bottom, left];
  
  }



  
  /**
 * 获得点做水平线或垂直线，到bounds的交点
 * @param point
 * @param bounds
 * @returns
 */
export function getPointToBoundsJoinPoint(point:Point, bounds:Bounds) {
    const area = getAreaOfBounds(bounds, point);
    let x = 0;
    let y = 0;
    switch (area) {
      case AreaType.top:
        x = point.x;
        y = bounds.absY;
        break;
      case AreaType.bottom:
        x = point.x;
        y = bounds.absY + bounds.height;
        break;
      case AreaType.left:
        x = bounds.absX;
        y = point.y;
        break;
      case AreaType.right:
        x = bounds.absX + bounds.width;
        y = point.y;
        break;
      default:
        return;
  
    }
    return new Point(x, y);
  }

  /**
 * 获得一个点在一个bounds的哪个区域
 * @param bounds
 * @param pt
 */
export function getAreaOfBounds(bounds:Bounds, pt:Point) {
    if (pt.x < bounds.absX) {
      if (pt.y < bounds.absY) {
        return AreaType.leftTop;
      } else if (pt.y > bounds.absY + bounds.height) {
        return AreaType.leftBottom;
      } else {
        return AreaType.left;
      }
  
    } else if (pt.x > bounds.absX + bounds.width) {
      if (pt.y < bounds.absY) {
        return AreaType.rightTop;
      } else if (pt.y > bounds.absY + bounds.height) {
        return AreaType.rightBottom;
      } else {
        return AreaType.right;
      }
    } else {
      if (pt.y < bounds.absY) {
        return AreaType.top;
      } else if (pt.y > bounds.absY + bounds.height) {
        return AreaType.bottom;
      } else {
        return AreaType.center;
      }
    }
  }


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


  // y = a*x +b ;根据一个点做此线的垂线，求垂线的a,b
// 垂线a = 1/a1
/**
 * y = 1/a * x +b
 * b = y - 1/a * x
 * b = y - a1 * x
 */

export const getVertexLineAB = (a1:number, p:IPoint) => {
    const a = 1 / a1;
    const b = p.y - a * p.x;
    return { a, b };
  };


  /**
 * 从起点到终点走直角，获取其waypoint，
 * @param startPoint
 * @param endPoint
 * @param startWithVertical 是否先走垂直
 */
export function getRightAngleWaypoint(startPoint:Point, endPoint:Point, startWithVertical = false) {

  let centerPoint = new Point();

  if (startWithVertical) {
    centerPoint.x = startPoint.x;
    centerPoint.y = endPoint.y;
  } else {
    centerPoint.x = endPoint.x;
    centerPoint.y = startPoint.y;
  }
  return [startPoint, centerPoint, endPoint];
}