import { SubShapeType } from "@hfdraw/types";
import SymbolShapeVue from "./SymbolShape.vue";
import CommonEdge from "./CommonEdge.vue";
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
  }
];


shapeComps.forEach(it => {
  markRaw(it.comp);
});


shapeCompManager.addShapes(shapeComps);
