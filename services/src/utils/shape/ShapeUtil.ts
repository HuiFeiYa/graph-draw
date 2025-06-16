import { Model } from "src/entities/model.entity";
import { ModelKey } from "src/types/model.type";
import { Point } from 'src/utils/Point';
import { ShapeEntity } from "src/entities/shape.entity";
import { Bounds, ShapeKey, StType, VertexType } from "@hfdraw/types";
import { shapeFactory } from "src/modules/models/ShapeFactory";
import { connectEdgeLength } from "src/modules/shape/shapeConfig/commonShapeOption";
import { cloneDeep } from "lodash";
import { NAME_MARGIN } from "src/constants";

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
    if (shape.nameBounds) {
      shape.nameBounds.absX = point.x + shape.nameBounds.x;
      shape.nameBounds.absY = point.y + shape.nameBounds.y;
    }
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
    const sourcePoint = new Point() // 线的起点
    const targetPoint = new Point() // 线的终点
    const shapeOption = shapeFactory.getModelShapeOption(targetShapeStType);
    const { x: xS, y: yS, width: widthS, height: heightS } = sourceShapeBounds; // source shape
    const { x: xT, y: yT, width: widthT, height: heightT } = shapeOption.bounds // target shape

    switch (index) {
      case VertexType.top: {
        targetPoint.x = sourcePoint.x = xS + widthS / 2; // 中点 x 相同，y 相差 connectEdgeLength
        sourcePoint.y = yS;
        targetPoint.y = sourcePoint.y - connectEdgeLength;
        shapePoint.x = sourcePoint.x - widthT / 2;
        shapePoint.y = targetPoint.y - heightT ; 
        break;
      }
      case VertexType.right: {
        sourcePoint.x = xS + widthS;
        targetPoint.y = sourcePoint.y = yS + heightS / 2; // 中点 y 相同，x 相差 connectEdgeLength
        targetPoint.x = sourcePoint.x + connectEdgeLength;
        shapePoint.x =  targetPoint.x ;
        shapePoint.y = targetPoint.y - heightT / 2;
        break;
      }
      case VertexType.bottom: {
        targetPoint.x = sourcePoint.x = xS + widthS / 2;  // 中点 x 相同，y 相差 connectEdgeLength
        sourcePoint.y = yS + heightS;
        targetPoint.y = sourcePoint.y + connectEdgeLength;
        shapePoint.x = targetPoint.x  - widthT / 2;
        shapePoint.y = targetPoint.y;
        break;
      }
      case VertexType.left: {
        targetPoint.y = sourcePoint.y = yS + heightS / 2; // 中点 y 相同，x 相差 connectEdgeLength
        sourcePoint.x = xS;  
        targetPoint.x = sourcePoint.x - connectEdgeLength;
        shapePoint.x = targetPoint.x - widthT;
        shapePoint.y = targetPoint.y - heightT / 2;
        break;
      }
    }
    return { shapePoint, sourcePoint, targetPoint};
  }
  pickChange(shape: ShapeEntity) {
    const change: Partial<ShapeEntity> = {};
    if (shape.boundsChanged) {
      change.bounds = shape.bounds;
    }

    if (shape.nameBoundsChanged) {
      change.nameBounds = shape.nameBounds;
    }

    if (shape.modelNameChanged) {
      change.modelName = shape.modelName;
    }
    if (shape.styleChanged) {
      change.style = shape.style;
    }
    if (shape.isDeleteChanged) {
      change.isDelete = shape.isDelete;
    }
    if (shape.waypointChanged) {
      change.waypoint = shape.waypoint;
    }
    return change;
  }

  cloneShapeMap(shapeMap: Map<string, ShapeEntity>, props: (keyof ShapeEntity)[] = ['id',  'bounds', 'waypoint']) {
   
    const map = new Map<string, ShapeEntity>();
    shapeMap.forEach((val, key) => {
      const newShape = new ShapeEntity();
      for (let it of props) {
        (newShape as any)[it] = cloneDeep(val[it]);
      }
      map.set(key, newShape);

    });
    return map;
  }

  getTopPartMinHeight(shape: ShapeEntity) {
    let height = shape.style.paddingTop || 0;
    height += NAME_MARGIN;
    return height;

  }
}
export const shapeUtil = new ShapeUtil()