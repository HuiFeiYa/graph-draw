import { Model } from "src/entities/model.entity";
import { ModelKey } from "src/types/model.type";
import { Point } from "../Point";
import { ShapeEntity } from "src/entities/shape.entity";

export class ShapeUtil {
    getModelKey(model: Model): ModelKey {
        return model.baseSt || model.metaclass;
    }
     /**
   *初始化图形， 设置shape的坐标和names，keywords， 建立relation
   * @param shape
   * @param parentShape
   * @param point
   * @param representModel
   */
  initShape(shape: ShapeEntity, point: Point) {

    shape.bounds.absX = point.x;
    shape.bounds.absY = point.y;
    shape.bounds.x = shape.bounds.absX ;
    shape.bounds.y = shape.bounds.absY ;
    const minWidth = this.getNameAndKeywordMinWidth(shape);
    if (shape.bounds.width < minWidth) {
      shape.bounds.width = minWidth;
    }
    return shape;

  }
  getNameAndKeywordMinWidth(shape: ShapeEntity) {
    let width = 0;
    return width;
  }
}
export const shapeUtil = new ShapeUtil()