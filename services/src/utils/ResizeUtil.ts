import { ShapeEntity } from "src/entities/shape.entity";

export class ResizeUtil {
    affectedShapes: Set<ShapeEntity> = new Set()
    constructor(public shapeMap: Map<string, ShapeEntity>) {
    }
      /**
   * 递归撑开撑开传入的shape的父元素及祖先元素的bounds，其受影响的shap将会记录在affectedShapes中
   * @param shape
   * @returns
   */
  expandParent(shape: ShapeEntity) {

  }
}  