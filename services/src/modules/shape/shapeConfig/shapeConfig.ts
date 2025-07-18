import { MetaclassType, ShapeKey, StType, SubShapeType } from "@hfdraw/types"
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
  [StType["SysML::Start"]]: {
    ...blockOption,
    style: {
      ...blockOption.style,
      borderRadius:10
    },
    shapeKey: ShapeKey.Block
  },
  [StType["SysML::Line"]]: {
    ...edgeOption,
    shapeKey: ShapeKey.StraightLine,
  },
  [StType["SysML::Pentagon"]]: {
    ...blockOption,
    shapeKey: ShapeKey.Pentagon,
    subShapeType: SubShapeType.PathShape,
    bounds: {
      absX: 0,
      absY: 0,
      width: 100,
      height: 100,
      x: 0,
      y: 0
    },
    nameBounds: {
      absX: 0,
      absY: 0,
      width: 100,
      height: 100,
      x: 0,
      y: 0
    }
  }
}