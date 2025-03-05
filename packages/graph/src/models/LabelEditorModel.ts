import { Bounds, Shape, StyleObject } from "@hfdraw/types";

export class LabelEditorModel {
  style: StyleObject = {};
  editingShape: Shape | undefined = undefined;
  showPreview = false;
  text = "";
  bounds?: Bounds;
  textareaRef: HTMLInputElement | null = null;

  labelEditorBlur() {
    // this.graph.graphOption.labelEditorBlur?.();
  }
  changeTextValue(v: string) {
    this.text = v;
  }
}
