import { reactive } from "vue";
import { GraphOption } from "./graphOption";
import { SiderBarDropModel } from "./SiderBarDropModel";
import { useProjectStore } from "../stores/project";
import { Shape } from "@hfdraw/types";
const projectStore = useProjectStore();

export const graph = reactive({});
export class GraphEditor {
  graphOption = new GraphOption(projectStore.projectId);

  graph

  shapes: Set<Shape> = new Set();
  constructor() {
    this.graph = graph;
    // graph.init();
    this.init()
  }
  init() {
    // this.tab.siderBarDropModel = reactive(new SiderBarDropModel(this.graph)) ;
  }
  addShapes(shapeList: Shape[]) {
    shapeList.forEach(shape => {
      this.shapes.add(shape)
    })
  }
}
