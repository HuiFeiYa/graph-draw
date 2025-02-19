import { SubShapeType } from "@hfdraw/types";
import SymbolShapeVue from "./SymbolShape.vue";
import CommonEdge from "./CommonEdge.vue";
import MindMapRect from "./MindMapRect.vue";
import { markRaw } from "vue";
import { shapeCompManager } from "./ShapeManager";
export * from './ShapeManager';

export const shapeComps: { key: SubShapeType; comp: any }[] = [
  {
    key: SubShapeType.Block,
    comp: SymbolShapeVue,
  },
  {
    key: SubShapeType.CommonEdge,
    comp: CommonEdge
  },
  {
    key: SubShapeType.MindMap,
    comp: MindMapRect
  }
];


shapeComps.forEach(it => {
  markRaw(it.comp);
});


shapeCompManager.addShapes(shapeComps);
