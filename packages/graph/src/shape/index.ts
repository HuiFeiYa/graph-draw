import { SubShapeType } from "@hfdraw/types";
import SymbolShapeVue from "./SymbolShape.vue";
import CommonEdge from "./CommonEdge.vue";
import { markRaw } from "vue";
import { shapeCompManager } from "./ShapeManager";
import CommonShape from "./commonShape.vue";
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
    key: SubShapeType.PathShape,
    comp: CommonShape
  }
];


shapeComps.forEach(it => {
  markRaw(it.comp);
});


shapeCompManager.addShapes(shapeComps);
