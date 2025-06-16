
import { ShapeEntity } from "src/entities/shape.entity";
import { shapeUtil } from "./ShapeUtil";
import { Bounds, ShapeType, VertexType } from "@hfdraw/types";

export class MinBoundsUtil {

  constructor(public shapeMap:Map<string, ShapeEntity>) {}

  /**
   * 获得图形的最小bounds（最大的absX,absY,最小的width，height）,返回绝对坐标
   */
  getMinBounds(shape:ShapeEntity, vertexType:VertexType, isAutoSize = false):Bounds {
    let MIN_WIDTH = shape.style.minWidth || 50;
    const MIN_HEIGHT = (shape.style.minHeight || 26) + (shape.style.paddingTop || 0);


    let result = new Bounds();
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    shape.children = shape.children || [];

    const symbolShapes = shape.children.filter(child => child.shapeType === ShapeType.Symbol );
    const  nameKeywordMinWidth = shapeUtil.getNameAndKeywordMinWidth(shape);

    if (vertexType === VertexType.leftTop) {
      // 左上角的点， 调整x,y,width,height
      // 计算图形的最小宽度和高度,其x2，y2不变
      x2 = shape.bounds.absX + shape.bounds.width;
      y2 = shape.bounds.absY + shape.bounds.height;

      x1 = x2 - MIN_WIDTH;
      y1 = y2 - MIN_HEIGHT;
      // // 计算keyword和name
      x1 = Math.min(x1, x2 - nameKeywordMinWidth);
      x1 = Math.min(x1, x2 - nameKeywordMinWidth);
      shape.children = shape.children || [];

   
      // 计算子元素
      symbolShapes.forEach(childShape => {

        x1 = Math.min(x1, childShape.bounds.absX - (shape.style.paddingLeft || 0));

      });

      // 从上往下算
      let height = shapeUtil.getTopPartMinHeight(shape);

      const nameHeight = height;

      y1 = y2 - height;

      // 计算子元素
      symbolShapes.forEach(childShape => {

        y1 = Math.min(y1, childShape.bounds.absY - nameHeight);

      });

    } else if (vertexType === VertexType.leftBottom) {
      // 左下角的控制点变化，x1，y2变化， x2,y1不变

      x2 = shape.bounds.absX + shape.bounds.width;
      y1 = shape.bounds.absY;

      x1 = x2 - MIN_WIDTH;
      y2 = shape.bounds.absY + MIN_HEIGHT;


      // 计算子元素
      // const symbolShapes = shape.children.filter(shape => shape.shapeType === ShapeType.Symbol);
      symbolShapes.forEach(childShape => {

        x1 = Math.min(x1, childShape.bounds.absX - (shape.style.paddingLeft || 0));

      });
 

      let height = shapeUtil.getTopPartMinHeight(shape);


      y2 = Math.max(y2, shape.bounds.absY + height);

      // 计算子元素
      symbolShapes.forEach(childShape => {

        y2 = Math.max(y2, childShape.bounds.absY + childShape.bounds.height + (shape.style.paddingBottom || 0));

      });

    } else if (vertexType === VertexType.rightTop) {
      // 右上角的点，
      // x1,y2不变，x2,y1变化
      // 计算图形的最小宽度和高度,其x2，y2不变
      x1 = shape.bounds.absX;
      y2 = shape.bounds.absY + shape.bounds.height;

      x2 = x1 + MIN_WIDTH;
      y1 = y2 - MIN_HEIGHT;

      x2 = Math.max(x2, x1 + nameKeywordMinWidth);


      // 计算子元素
      symbolShapes.forEach(childShape => {

        x2 = Math.max(x2, childShape.bounds.absX + childShape.bounds.width + (shape.style.paddingRight || 0));

      });

      // 从上往下算
      let height = shapeUtil.getTopPartMinHeight(shape);

      y1 = y2 - height;

      const nameHeight = height;
      // 计算子元素
      symbolShapes.forEach(childShape => {

        y1 = Math.min(y1, childShape.bounds.absY - nameHeight);

      });
    } else if (vertexType === VertexType.rightBottom) {
      // 右下角的点，
      // x1,y1不变，x2,y2变化
      // 计算图形的最小宽度和高度,其x2，y2不变
      x1 = shape.bounds.absX;
      y1 = shape.bounds.absY;

      x2 = x1 + MIN_WIDTH;
      y2 = y1 + MIN_HEIGHT;

      x2 = Math.max(x2, x1 + nameKeywordMinWidth);

      // 计算compartment

      // 计算子元素
      symbolShapes.forEach(childShape => {

        x2 = Math.max(x2, childShape.bounds.absX + childShape.bounds.width + (shape.style.paddingRight || 0));

      });

      // ----- 计算高度
      // 从上往下算
      let height = shapeUtil.getTopPartMinHeight(shape);


      y2 = Math.max(y2, shape.bounds.absY + height);

      // 计算子元素
      symbolShapes.forEach(childShape => {
        y2 = Math.max(y2, childShape.bounds.absY + childShape.bounds.height + (shape.style.paddingBottom || 0));
      });
    }

    result.absX = x1;
    result.absY = y1;
    let mWidth = x2 - x1;
    let mHeight = y2 - y1;

    result.width = mWidth;
    result.height = mHeight;

    return result;

  }

}

