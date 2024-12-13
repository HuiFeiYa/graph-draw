import { ShapeKey, ShapeType, SubShapeType } from "@hfdraw/types";
import { ShapeOption } from "src/types/model.type";

export const baseShapeOption:Partial<ShapeOption> = {
    shapeType: ShapeType.Symbol,
    subShapeType: SubShapeType.Block,
    shapeKey: undefined,
    style: {
        background: 'linear-gradient(to right,#DDCD9E,#FDF7DF)',
        strokeColor: "#ad9d85"
    },
    bounds: { absX: 0, absY: 0, width: 100, height: 80, x: 0, y: 0 },
}

export const diagramOption:Partial<ShapeOption> = {
    ...baseShapeOption,
    shapeType: ShapeType.Diagram,
    subShapeType: SubShapeType.CommonDiagram,
    shapeKey: ShapeKey.Diagram
}

export const blockOption:Partial<ShapeOption> = {
    ...baseShapeOption,
    shapeType: ShapeType.Symbol,
    subShapeType: SubShapeType.Block,
    shapeKey: ShapeKey.Block,
    style: {
      ...baseShapeOption.style,
      background: 'linear-gradient(to right,#DDCD9E,#FDF7DF)',
      strokeColor: "#ad9d85",
      strokeWidth: 1
    },
    bounds: { absX: 0, absY: 0, width: 100, height: 50, x: 0, y: 0 },
  };