import { Shape } from "@hfdraw/types";
import { GraphModel } from "./GraphModel";


export class MindMapModel {
  selectShape: Shape | undefined;   
  constructor(public graph:GraphModel) {

  }
  get isRootShape() {
    if (!this.selectShape) {
        return false;
    }
    return this.selectShape.style.retrospectOption?.shapeDepth === 1;
  }
  setSelectShape(shape: Shape) {
    if (!shape.style.retrospectOption?.shapeDepth || shape.style.retrospectOption?.shapeDepth  >=3) {
      return 
    }
    this.selectShape = shape;
  }
  clearSelectShape() {
    this.selectShape = undefined;
  }
  
}