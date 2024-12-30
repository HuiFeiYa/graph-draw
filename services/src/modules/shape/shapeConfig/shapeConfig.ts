import { MetaclassType, ShapeKey, StType } from "@hfdraw/types"
import { ShapeOption } from "src/types/model.type"
import { blockOption, diagramOption, edgeOption } from "./commonShapeOption"

type ConfigItem = Partial<ShapeOption>
export const modelKeyConfig: Record<string, ConfigItem> = {
  [MetaclassType.Diagram]: {
    ...diagramOption
  },
  [StType["SysML::Blocks::Block"]]: {
    ...blockOption,
    shapeKey: ShapeKey.Block
  },
  [StType["SysML::Association"]]: {
    ...edgeOption,
    shapeKey: ShapeKey.Association,
  }
}