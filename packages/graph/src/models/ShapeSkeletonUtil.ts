import { Shape } from "@hfdraw/types";
import { PathBuilder } from "../util/PathBuilder";


export type SkeletonDrawer = (p:PathBuilder, shape:Shape, shapeMap:Map<string, Shape>)=>void

/**
 * 图形骨架绘制工具类
 * 根据subShapeType和bounds绘制骨架path
 * 骨架path用于显示move预览和resize预览
 */
class ShapeSkeletonUtil {

  getDefaultPath(p:PathBuilder, shape:Shape) {
    return this.getRectPath(p, shape);
  }
  /**
   * 通用矩形图元边框
   */
  getRectPath(p:PathBuilder, shape:Shape) {
    const { absX, absY, width, height } = shape.bounds;
    const borderRadius = shape.style?.borderRadius || 0;
    const cx = borderRadius;
    const cy = borderRadius;
    // 以左侧向下偏移点为起点话
    p.MoveTo(absX, absY + borderRadius);
    p.Arc(cx, cy, 0, 0, 1, absX + borderRadius, absY);
    p.lineHorizontalTo(width - borderRadius * 2);
    p.Arc(cx, cy, 0, 0, 1, absX + width, absY + borderRadius);
    p.lineVerticalTo(height - borderRadius * 2);
    p.Arc(cx, cy, 0, 0, 1, absX + width - borderRadius, absY + height);
    p.lineHorizontalTo(-(width - borderRadius * 2));
    p.Arc(cx, cy, 0, 0, 1, absX, absY + height - borderRadius);
    p.closePath();
  }
}

export const shapeSkeletonUtil = new ShapeSkeletonUtil();