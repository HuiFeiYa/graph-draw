import { Shape } from "@hfdraw/types";
import { GraphModel } from "./GraphModel";

export class HoverModel {
    hoverShape: Shape|null = null;

    constructor(public graph:GraphModel) {}
    
    setHoverShape(hoverShape: Shape) {
        this.hoverShape = hoverShape;
    }
    clearHoverShape() {
        this.hoverShape = null;
    }
    onShapeHover(event:any,shape: Shape) {
        if (this.graph.selectionModel.selectedShapes.length === 0) {
            this.setHoverShape(shape);
        }
    }
}