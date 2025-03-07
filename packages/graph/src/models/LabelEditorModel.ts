import { Bounds, Shape, StyleObject } from "@hfdraw/types";
import { GraphModel } from "./GraphModel";

export class LabelEditorModel {
  style: StyleObject = {};
  editingShape: Shape | undefined = undefined;
  showPreview = false;
  text = "";
  originText = "";
  bounds?: Bounds;
  textareaRef: HTMLInputElement | null = null;
  constructor(public graph: GraphModel) { }
  async labelEditorBlur() {
    // 等待文本内容更新以后再初始化状态
    await this.save();
    this.initPreviewState();
  }
  changeTextValue(v: string) {
    this.text = v;
  }

  onShapeNameLabelClick(event: MouseEvent, shape: Shape, labelType: string) {
    const selection = this.graph.selectionModel.selection;
    // if (selection.length === 1 && selection[0] === shape) {
        this.trySetInEdit(shape, event);
      // }
  }
  async trySetInEdit(shape:Shape, event: MouseEvent) {

    this.setShapeInEdit(shape as Shape);
  }
  setShapeInEdit(shape: Shape) {
    this.editingShape = shape;
    this.text = shape.modelName;
    this.style = shape.style;
    this.bounds = shape.nameBounds; 
    this.showPreview = true;
  }
  initPreviewState() {
    this.style = {};
    this.editingShape = undefined;
    this.text = "";
    this.bounds = undefined;
    this.showPreview = false;
    this.originText = '';
  }
  async save() {
    if (!this.editingShape) return;
    await this.graph.graphOption.saveText(this.editingShape, this.text)
  }
}
