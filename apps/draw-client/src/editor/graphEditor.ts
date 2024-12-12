import { reactive } from "vue";
import { GraphOption } from "./graphOption";
import { SiderBarDropModel } from "./SiderBarDropModel";
const graphOption = new GraphOption()
export const graph = reactive({});
export class GraphEditor {
  graphOption;

  graph

  shapes
  siderBarDropModel
  constructor(tab) {
    this.graph = graph;
    // graph.init();
    this.init()
  }
  init() {
    // this.tab.siderBarDropModel = reactive(new SiderBarDropModel(this.graph)) ;
  }
  addShapes(shapeList) {
    shapeList.forEach(shape => {
      this.shapes.add(shape)
    })
  }
}
