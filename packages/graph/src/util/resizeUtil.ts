import { Shape } from "@hfdraw/types";

/**
 * 图形大小调整工具类
 */
export class ResizeUtil {
    affectedShapes: Set<Shape> = new Set()
    constructor(public shapeMap: Map<string, Shape>) {
  
    }
}