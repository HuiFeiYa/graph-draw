import { SubShapeType } from "@hfdraw/types";
import SymbolShapeVue from "./SymbolShape.vue";
import { markRaw } from "vue";
import { shapeCompManager } from "./ShapeManager";
export * from './ShapeManager';

export const shapeComps: { key: SubShapeType; comp: any }[] = [
  {
    key: SubShapeType.Block,
    comp: SymbolShapeVue,
  },
];


shapeComps.forEach(it => {
  markRaw(it.comp);
});


shapeCompManager.addShapes(shapeComps);
