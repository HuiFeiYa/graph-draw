import { Bounds } from "@hfdraw/types";
import { float } from "../common";
import { Point } from "../Point";

type LineLimit = (p:Point)=>boolean
type LineLmits = LineLimit[]

/**
 * 用来表达一条线，y=ax+b
 */
export class Line {
  /**
   * 斜率，Infinaty表示垂直，也是tan值,如果是负无穷则替换为正无穷
   */
  a=0 // 斜率，Infinaty表示垂直，也是tan值
  /**
   * x=0时的y坐标,
   */
  b=0

  /**
   * 点位约束，返回false则表示不在线的范围内
   */
  limits?: LineLmits

  /**
   * 当a为无穷或负无穷，必须有x0， x0表示线与x轴的交点x坐标
   */
  x0?:number

  constructor(a:number, b:number, x0?:number, limits?:LineLmits) {
    if (a === -Infinity) {
      a = Infinity;
    }
    this.a = a;
    this.b = b;
    this.limits = limits;
    this.x0 = x0;

  }
  /**
   * 通过两个点构造
   * @param p1
   * @param p2
   * @param limits
   * @returns
   */
  static fromPoints(p1:Point, p2:Point, limits?:LineLmits) {
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;
    /**
     * y1 = a*x1 +b
     * y2 = a*x2 +b
     *
     * 推导a:
     * y1-y2 = a*(x1-x2)
     * ==
     * a = (y1-y2)/(x1-x2)
     *
     * 推导b:
     *
     * a = (y1-b)/x1
     * a = (y2-b)/x2
     * ==
     * (y1-b)/x1 = (y2-b)/x2
     *
     * (y1-b)*x2 = (y2-b)*x1
     *
     * ==
     *
     * y1*x2 - b*x2 = y2*x1 - b*x1;
     * ==
     *
     * b*x1 - b*x2 = y2*x1 - y1*x2
     * ==
     * b = (y2*x1 - y1*x2 )/(x1-x2)
     */
    let a = (y1 - y2) / (x1 - x2);
    const b = float((y2 * x1 - y1 * x2) / (x1 - x2));
    let x0:number|undefined;
    if (p2.x === p1.x) {
      x0 = p1.x;
    }

    if (a === -Infinity) {
      a = Infinity;
    }
    return new Line(a, b, x0, limits);

  }
  /**
   * 创建一个射线的约束
   * @param startPoint
   * @param endPoint
   * @returns
   */
  static createRayLineLimit(startPoint:Point, endPoint:Point) {
    const toRight = endPoint.x - startPoint.x;
    const toBottom = endPoint.y - startPoint.y;
    const limit = (p:Point) => {
      if (toRight === 0) {
        if (p.x !== startPoint.x) {
          return false;
        }
      } else if (toRight > 0) {
        if (p.x <= startPoint.x) {
          return false;
        }
      } else if (toRight < 0) {
        if (p.x >= startPoint.x) {
          return false;
        }
      }

      if (toBottom === 0) {
        if (p.y !== startPoint.y) {
          return false;
        }
      } else if (toBottom > 0) {
        if (p.y <= startPoint.y) {
          return false;
        }
      } else if (toBottom < 0) {
        if (p.y >= startPoint.y) {
          return false;
        }
      }
      return true;
    };
    return limit;
  }
  /**
   *生成一条射线,实际上是给一条直线应用了一个约束
   * @param startPoint
   * @param toPoint
   */
  static createRayLine(startPoint:Point, endPoint:Point) {

    const limit = this.createRayLineLimit(startPoint, endPoint);

    const line = this.fromPoints(startPoint, endPoint, [limit]);
    return line;

  }
  /**
   * 生成一条线段,实际上是给一条直线应用了2个约束
   * @param startPoint
   * @param endPoint
   * @returns
   */
  static createSegmentLine(point1:Point, point2:Point) {
    const limit1 = this.createRayLineLimit(point1, point2);
    const limit2 = this.createRayLineLimit(point2, point1);

    const line = this.fromPoints(point1, point2, [limit1, limit2]);
    return line;
  }

  /**
   * 是否与另一条线平行
   */
  isParallelWith(line2:Line) {
    return this.a == line2.a;
  }

  /**
   * 获取与另一条线的交点， 如果没有交点返回undefined
   * @param line2
   * @returns
   */
  getJoinPointWith(line2:Line):Point|undefined {
    if (this.isParallelWith(line2)) return undefined;

    const a1 = this.a;
    const b1 = this.b;
    const a2 = line2.a;
    const b2 = line2.b;
    let x:number;
    let y:number;
    if (a1 === Infinity) {
      x = this.x0 as number;
      y = a2 * x + b2;
    } else if (a2 === Infinity) {
      x = line2.x0 as number;
      y = a1 * x + b1;
    } else {
    /**
     * y = a1*x+b1;
     * y = a2*x+b2;
     *
     * 推导x：
     *
     * a1*x+b1 = a2*x+b2
     *
     * ==
     * (a1-a2)*x = b2-b1;
     *
     * ==
     *
     * x = (b2-b1)/(a1-a2)
     *
     *
     * 推导y：
     *
     * y - b1 = a1*x;
     * y - b2 = a2*x;
     *
     * ==
     *
     * (y-b1) / a1 = (y-b2) /a2
     *
     * ==
     * (y-b1)* a2 = (y-b2)* a1;
     *
     * ==
     * y*a2- b1*a2 = y*a1 - b2*a1;
     *
     * ==
     * y*(a2-a1)= b1*a2 - b2*a1
     * ==
     * y = (b1*a2 - b2*a1)/(a2-a1)
     *
     */
      x = (b2 - b1) / (a1 - a2);

      y = (b1 * a2 - b2 * a1) / (a2 - a1);
    }
    if (typeof x === 'number' && typeof y === 'number') {
      const pt = new Point(float(x), float(y));

      if (this.limits) {
        const valid = this.isSatisfiedLimits(pt);
        if (!valid) return undefined;
      }
      if (line2.limits) {
        const valid = line2.isSatisfiedLimits(pt);
        if (!valid) return undefined;
      }
      return pt;
    }
  }

  /**
   * 判断一个点是否满足此线的约束
   * @param x
   * @param y
   * @returns
   */
  isSatisfiedLimits(p: Point) {
    if (this.limits?.length) {
      for (let limit of this.limits) {
        if (!limit(p)) {
          return false;
        }
      }
      return true;
    } else {
      return true;
    }

  }

  getDistanceToPoint(p:Point) {
    if (this.a === Infinity) {
      return Math.abs(p.x - (this.x0 as number));
    } else if (this.a === 0) {
      return Math.abs(p.y - this.b);

    } else {
      const x1 = (p.y - this.a) / this.b;
      const len = p.x - x1;
      const sin = this.b / Math.sqrt(this.b ** 2 + 1);
      const distance = Math.abs(len * sin);
      return distance;
    }

  }

  /**
   * 根据一个bounds，创建其4个线段
   */
  static createBoundsSegmentLines(bounds:Bounds) {
    const p1 = new Point(bounds.absX, bounds.absY);
    const p2 = new Point(bounds.absX + bounds.width, bounds.absY);
    const p3 = new Point(bounds.absX + bounds.width, bounds.absY + bounds.height);
    const p4 = new Point(bounds.absX, bounds.absY + bounds.height);
    const pts = [p1, p2, p3, p4, p1];
    const lines:Line[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const line1 = Line.createSegmentLine(pts[i], pts[i + 1]);
      lines.push(line1);

    }
    return lines;
  }

  static createEdgeSegmentLines(waypoints:Point[]) {
    const lines:Line[] = [];
    waypoints = waypoints.filter(Boolean);
    for (let i = 0; i < waypoints.length - 1; i++) {
      const line1 = Line.createSegmentLine(waypoints[i], waypoints[i + 1]);
      lines.push(line1);

    }
    return lines;
  }

}

