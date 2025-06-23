import { IPoint, Shape, StyleObject } from "@hfdraw/types";
import {
  getAreaOfBounds,
  getB,
  getBoundsBorderCenterPoint,
  getBoundsCenterPoint,
  getClosePoint,
  getCloseSide,
  getJoinPointBetweenLineAndBounds,
  getOutCenterRayLines,
  getPointToBoundsJoinPoint,
  getRightAngleWaypoint,
  getVertexLineAB,
} from "../common";
import { Point } from "../Point";
import { AreaType } from "../constant";
import { Line } from "./Line";

export type ShapeMap = Map<string, Shape>;

export class RightAngleEdgeUtil {
  readonly lineOutMargin = 24;

  // -------------- 生成预览线的方法实现写到前端 ---------
  /**
   * 前端连线时，生成预览线的waypoint
   * @param shapeMap
   * @param edgeStyle
   * @param sourceShape 起点图形
   * @param targetPoint 目标点
   * @param targetShape 终点图形，可能不传，表示当前没有可连接的目标图形
   * @returns
   */
  generateConnectPreviewWaypoint(
    shapeMap: ShapeMap,
    edgeStyle: StyleObject,
    sourceShape: Shape | undefined,
    targetPoint: Point,
    targetShape?: Shape,
    sourcePoint?: Point,
    clickedPoints?: Point[]
  ): Point[] {
    // if (sourcePoint){
    //   return [sourcePoint, targetPoint];
    // } else {
    if (sourceShape) {
      if (targetShape) {
        return this.getHasTargetShapeWaypoint(
          shapeMap,
          edgeStyle,
          sourceShape,
          targetPoint,
          targetShape,
          sourcePoint,
          clickedPoints
        );
      } else {
        // 无目标的线
        return this.getNoTargetShapeWaypoint(sourceShape, targetPoint);
      }
    } else {
      if (targetShape && sourcePoint) {
        return this.getNoSourceShapeWaypoint(sourcePoint, targetShape);
      } else {
        return [];
      }
    }
  }
  getP0P1(targetPoint: Point, targetShape: Shape) {
    const tBounds = targetShape.bounds;
    const closeSide = getCloseSide(targetPoint, tBounds);
    let p0 = new Point();

    let p1 = new Point();
    switch (closeSide) {
      case AreaType.top: {
        p0.x = targetPoint.x;
        p0.y = tBounds.absY;
        p1.x = p0.x;
        p1.y = p0.y - this.lineOutMargin;
        break;
      }
      case AreaType.left: {
        p0.x = tBounds.absX;
        p0.y = targetPoint.y;
        p1.x = p0.x - this.lineOutMargin;
        p1.y = p0.y;
        break;
      }
      case AreaType.right: {
        p0.x = tBounds.absX + tBounds.width;
        p0.y = targetPoint.y;
        p1.x = p0.x + this.lineOutMargin;
        p1.y = p0.y;
        break;
      }
      case AreaType.bottom: {
        p0.x = p0.x = targetPoint.x;
        p0.y = tBounds.absY + tBounds.height;
        p1.x = p0.x;
        p1.y = p0.y + this.lineOutMargin;
        break;
      }

      default:
        throw new Error("closeSide error");
    }
    return [p0, p1];
  }

  /**
   * line 是从p0开始经过p1的一条射线
   * @param p0
   * @param p1
   * @returns
   */
  getLine1(p0: Point, p1: Point) {
    const line1 = Line.createRayLine(p0, p1);
    return line1;
  }
  getHasTargetShapeWaypoint(
    shapeMap: ShapeMap,
    edgeStyle: StyleObject,
    sourceShape: Shape,
    targetPoint: Point,
    targetShape: Shape,
    sourcePoint?: Point,
    clickedPoints?: Point[]
  ): Point[] {
    // const targetPointArea = getAreaOfBounds(targetShape.bounds, targetPoint);
    // const closeSide = getCloseSide(targetPoint, targetShape.bounds);
    // console.log('getHasTargetShapeWaypoint');
    const sourceCenter = getBoundsCenterPoint(sourceShape.bounds);
    const [p0, p1] = this.getP0P1(targetPoint, targetShape);
    const line1 = this.getLine1(p0, p1);
    const sourceBoundsLines = Line.createBoundsSegmentLines(sourceShape.bounds);
    const targetBoundsLines = Line.createBoundsSegmentLines(targetShape.bounds);

    const joinPts1 = getJoinPointBetweenLineAndBounds(
      line1,
      sourceBoundsLines,
      true
    );
    if (joinPts1.length) {
      // 取最近的

      const joinPoint = getClosePoint(p0, joinPts1);
      // console.log('find1');
      return [joinPoint, targetPoint];
    } else {
      // 没有直接相交的点， 找外部十字射线
      let outCenterRayLines: Line[] = getOutCenterRayLines(sourceShape.bounds);
      const joinPts2 = getJoinPointBetweenLineAndBounds(
        line1,
        outCenterRayLines,
        false
      );
      if (joinPts2[0]) {
        const p2 = joinPts2[0];
        const p3 = getPointToBoundsJoinPoint(p2, sourceShape.bounds);
        if (!p3) {
          return [];
        }
        // console.log('find2');
        return [p3, p2, targetPoint];
      } else {
        // 找不到外部十字射线的p2， 找p1到sourceBounds的直线交点p4
        const p4 = getPointToBoundsJoinPoint(p1, sourceShape.bounds);
        if (p4 && getB(p4, p1) !== getB(p1, targetPoint)) {
          // console.log('find3');
          return [p4, p1, targetPoint];
        } else {
          const { a, b } = getVertexLineAB(line1.a, p1);
          const line2 = new Line(a, b);
          if (a === Infinity || a === -Infinity) {
            line2.x0 = p1.x;
          }
          const joinPts3 = getJoinPointBetweenLineAndBounds(
            line2,
            outCenterRayLines,
            false
          );
          if (joinPts3[0]) {
            const p4_ = joinPts3[0];
            const p5 = getPointToBoundsJoinPoint(p4_, sourceShape.bounds);
            if (p5) {
              //  检查p5与p4的线段是否与target相交
              const line3 = Line.createSegmentLine(p5, p4_);

              const joinPts4 = getJoinPointBetweenLineAndBounds(
                line3,
                targetBoundsLines,
                false
              ); // 与target相交
              if (joinPts4[0]) {
                if (p5.y === p4_.y) {
                  // todo 移动相交的线
                  p5.y = targetShape.bounds.absY - this.lineOutMargin;
                  p4_.y = targetShape.bounds.absY - this.lineOutMargin;

                  if (p5.y < sourceShape.bounds.absY) {
                    const borderCenters = getBoundsBorderCenterPoint(
                      sourceShape.bounds
                    );
                    p5.x = borderCenters.top.x;
                    const p6 = borderCenters.top;
                    // console.log('find5');
                    return [p6, p5, p4_, p1, targetPoint];
                  }
                } else {
                  p5.x = targetShape.bounds.absX - this.lineOutMargin;
                  p4_.x = targetShape.bounds.absX - this.lineOutMargin;
                  if (p5.x < sourceShape.bounds.absX) {
                    const borderCenters = getBoundsBorderCenterPoint(
                      sourceShape.bounds
                    );
                    p5.y = borderCenters.left.y;
                    const p6 = borderCenters.left;
                    // console.log('find6');
                    return [p6, p5, p4_, p1, targetPoint];
                  }
                }
              }
              // console.log('find4');
              return [p5, p4_, p1, targetPoint];
            } else {
              return [];
            }
          }
        }
      }
    }
    return [];
  }
  /**
   * 拖拽线的起点拖拽时，起点未连接到新的 shape 时更新线的 waypoint 方法
   * @param sourcePoint 起点位置
   * @param targetShape 目标图形
   * @returns
   */
  getNoSourceShapeWaypoint(sourcePoint: Point, targetShape: Shape) {
    const targetPointArea = getAreaOfBounds(targetShape.bounds, sourcePoint);

    // 无目标的线
    if (targetPointArea === AreaType.center) {
      return [];
    }
    let startWithVertical =
      targetShape.bounds.width > targetShape.bounds.height;
    const boundsCenter = getBoundsBorderCenterPoint(targetShape.bounds);
    const targetBounds = targetShape.bounds;
    let startPoint: Point | undefined = undefined;
    if (
      [
        AreaType.leftTop,
        AreaType.rightTop,
        AreaType.leftBottom,
        AreaType.rightBottom,
      ].includes(targetPointArea)
    ) {
      return this.getStartPoint(
        startWithVertical,
        targetPointArea,
        boundsCenter,
        sourcePoint
      );
    } else {
      switch (targetPointArea) {
        case AreaType.left:
          startPoint = new Point(targetBounds.absX, sourcePoint.y);
          break;
        case AreaType.right:
          startPoint = new Point(
            targetBounds.absX + targetBounds.width,
            sourcePoint.y
          );
          break;
        case AreaType.top:
          startPoint = new Point(sourcePoint.x, targetBounds.absY);
          break;
        case AreaType.bottom:
          startPoint = new Point(
            sourcePoint.x,
            targetBounds.absY + targetBounds.height
          );
          break;

        default:
          break;
      }
      if (!startPoint) {
        throw new Error("startPoint not found");
      }
      return [startPoint, sourcePoint];
    }
  }
  getStartPoint(
    startWithVertical: boolean,
    pointArea: AreaType,
    boundsCenter: {
      top: Point;
      left: Point;
      right: Point;
      bottom: Point;
    },
    point: Point
  ) {
    let startPoint: Point | undefined = undefined;
    if (startWithVertical) {
      switch (pointArea) {
        case AreaType.leftTop:
        case AreaType.rightTop: {
          startPoint = boundsCenter.top;
          break;
        }
        case AreaType.leftBottom:
        case AreaType.rightBottom: {
          startPoint = boundsCenter.bottom;
          break;
        }

        default:
          break;
      }
    } else {
      switch (pointArea) {
        case AreaType.leftTop:
        case AreaType.leftBottom: {
          startPoint = boundsCenter.left;
          break;
        }
        case AreaType.rightTop:
        case AreaType.rightBottom: {
          startPoint = boundsCenter.right;
          break;
        }

        default:
          break;
      }
    }
    if (!startPoint) {
      throw new Error("startPoint not found");
    }
    return getRightAngleWaypoint(startPoint, point, startWithVertical);
  }


   /**
   * 无目标的预览线
   * @param shapeMap
   * @param edgeStyle
   * @param sourceShape
   * @param targetPoint
   * @param sourcePoint
   * @param clickedPoints
   * @returns
   */
  getNoTargetShapeWaypoint(sourceShape:Shape, targetPoint:Point) {
    const targetPointArea = getAreaOfBounds(sourceShape.bounds, targetPoint);

    // 无目标的线
    if (targetPointArea === AreaType.center) {
      return [];
    }
    let startWithVertical = sourceShape.bounds.width > sourceShape.bounds.height;
    const boundsCenter = getBoundsBorderCenterPoint(sourceShape.bounds);
    const sourceBounds = sourceShape.bounds;
    let startPoint:Point|undefined = undefined;
    if ([AreaType.leftTop, AreaType.rightTop, AreaType.leftBottom, AreaType.rightBottom].includes(targetPointArea)) {
      return this.getStartPoint(startWithVertical, targetPointArea, boundsCenter, targetPoint);
    } else {
      switch (targetPointArea) {
        case AreaType.left:
          startPoint = new Point(sourceBounds.absX, targetPoint.y);
          break;
        case AreaType.right:
          startPoint = new Point(sourceBounds.absX + sourceBounds.width, targetPoint.y);
          break;
        case AreaType.top:
          startPoint = new Point(targetPoint.x, sourceBounds.absY);
          break;
        case AreaType.bottom:
          startPoint = new Point(targetPoint.x, sourceBounds.absY + sourceBounds.height);
          break;

        default:
          break;
      }
      if (!startPoint) {
        throw new Error("startPoint not found");

      }
      return [startPoint, targetPoint];
    }
  }
}

export const rightAngleEdgeUtil = new RightAngleEdgeUtil();
