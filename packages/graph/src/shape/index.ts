import { SubShapeType } from "@hfdraw/types";
import SymbolShapeVue from "./SymbolShape.vue";

export const shapeManager: { [key in SubShapeType]?:  any} = {
  [SubShapeType.Block]: SymbolShapeVue 
}