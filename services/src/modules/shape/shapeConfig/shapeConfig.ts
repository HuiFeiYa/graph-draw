import { MetaclassType, ShapeKey, StType } from "@hfdraw/types"
import { ShapeOption } from "src/types/model.type"
import { blockOption, edgeOption, mindMapOption } from "./commonShapeOption"

type ConfigItem = Partial<ShapeOption>
export const modelKeyConfig: Record<string, ConfigItem> = {
  [StType["SysML::Blocks::Block"]]: {
    ...blockOption,
    shapeKey: ShapeKey.Block
  },
  [StType["SysML::Association"]]: {
    ...edgeOption,
    shapeKey: ShapeKey.Association,
  },
  [StType["SysML::Line"]]: {
    ...edgeOption,
    shapeKey: ShapeKey.StraightLine,
  },

  [StType["SysML::MindMap"]]: {
    ...mindMapOption,
    shapeKey: ShapeKey.MindMapShape
  }
}