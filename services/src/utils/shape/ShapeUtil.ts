import { Model } from "src/entities/model.entity";
import { ModelKey } from "src/types/model.type";
import { Point } from 'src/utils/Point';
import { ShapeEntity } from "src/entities/shape.entity";
import { Bounds, ShapeKey, StType, VertexType } from "@hfdraw/types";
import { shapeFactory } from "src/modules/models/ShapeFactory";
import { connectEdgeLength } from "src/modules/shape/shapeConfig/commonShapeOption";

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
    shape.bounds.x = shape.bounds.absX;
    shape.bounds.y = shape.bounds.absY;
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
  initEdgeShape(sourceShape: ShapeEntity, targetShape: ShapeEntity, shape: ShapeEntity, points: Point[]) {
    shape.waypoint = points; // this.getNearPoint(targetShape, points.slice());

    shape.sourceId = sourceShape?.id;
    shape.targetId = targetShape?.id;
    shape.shapeKey = ShapeKey.Association
    return shape;
  }
  getTargetShapePoint(sourceShapeBounds: Bounds, targetShapeStType: StType, index: VertexType) {
    const shapePoint = new Point() // target Shape 起始点
    const sourcPoint = new Point() // 线的起点
    const targetPoint = new Point() // 线的终点
    const shapeOption = shapeFactory.getModelShapeOption(targetShapeStType);
    const { x: xS, y: yS, width: widthS, height: heightS } = sourceShapeBounds; // source shape
    const { x: xT, y: yT, width: widthT, height: heightT } = shapeOption.bounds // target shape

    switch (index) {
      case VertexType.top: {
        targetPoint.x = sourcPoint.x = xS + widthS / 2; // 中点 x 相同，y 相差 connectEdgeLength
        sourcPoint.y = yS;
        targetPoint.y = sourcPoint.y - connectEdgeLength;
        shapePoint.x = sourcPoint.x - widthT / 2;
        shapePoint.y = targetPoint.y - heightT ; 
        break;
      }
      case VertexType.right: {
        sourcPoint.x = xS + widthS;
        targetPoint.y = sourcPoint.y = yS + heightS / 2; // 中点 y 相同，x 相差 connectEdgeLength
        targetPoint.x = sourcPoint.x + connectEdgeLength;
        shapePoint.x =  targetPoint.x - widthT / 2  ;
        shapePoint.y = targetPoint.y - heightT / 2;
        break;
      }
      case VertexType.bottom: {
        targetPoint.x = sourcPoint.x = xS + widthS / 2;  // 中点 x 相同，y 相差 connectEdgeLength
        sourcPoint.y = yS + heightS;
        targetPoint.y = sourcPoint.y + connectEdgeLength;
        shapePoint.x = targetPoint.x  - widthT / 2;
        shapePoint.y = targetPoint.y;
        break;
      }
      case VertexType.left: {
        targetPoint.y = sourcPoint.y = yS + heightS / 2; // 中点 y 相同，x 相差 connectEdgeLength
        sourcPoint.x = xS;  
        targetPoint.x = sourcPoint.x - connectEdgeLength;
        shapePoint.x = targetPoint.x - widthT / 2;
        shapePoint.y = targetPoint.y - heightT / 2;
        break;
      }
    }
    return { shapePoint, sourcPoint, targetPoint};
  }
}
export const shapeUtil = new ShapeUtil()