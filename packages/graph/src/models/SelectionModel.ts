import { EventType, Shape } from "@hfdraw/types";
import { GraphModel } from "./GraphModel";
import { emitter } from "../util/Emitter";

export class SelectionModel {
    selectedShapes: Shape[] = []
    get selection() {
        return this.selectedShapes
    }
    constructor(public graph:GraphModel) {}
    emitSelectionChange() {
        emitter.emit(EventType.SELECTION_CHANGE, this.selectedShapes);
    }
    setSelection(arr:Shape[]) {
        this.selectedShapes = arr
        this.emitSelectionChange()
    }
    clearSelection() {
        this.selectedShapes= [];
        this.emitSelectionChange();
    }
    onShapeClick(event:MouseEvent | null, shape:Shape){
        let selectableShape = shape;
        this.setSelectionShapes([selectableShape]);
    }
    setSelectionShapes(arr:Shape[]) {
      this.selectedShapes = arr;
    }
}