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
  },
  [StType["SysML::Mark"]]: {
    ...blockOption,
    shapeKey: ShapeKey.Mark,
    subShapeType: SubShapeType.PathShape,
    bounds: {
      absX: 0,
      absY: 0,
      width: 120,
      height: 120,
      x: 0,
      y: 0
    },
    nameBounds: {
      absX: 0,
      absY: 0,
      width: 120,
      height: 120,
      x: 0,
      y: 0
    }
  },
  [StType["SysML::Rhombus"]]: {
    ...blockOption,
    shapeKey: ShapeKey.Rhombus,
    subShapeType: SubShapeType.PathShape,
    bounds: {
      absX: 0,
      absY: 0,
      width: 116,
      height: 90,
      x: 0,
      y: 0
    },
    nameBounds: {
      absX: 0,
      absY: 0,
      width: 116,
      height: 90,
      x: 0,
      y: 0
    }
  },
  [StType["SysML::Triangle"]]: {
    ...blockOption,
    shapeKey: ShapeKey.Triangle,
    subShapeType: SubShapeType.PathShape,
    bounds: {
      absX: 0,
      absY: 0,
      width: 100,
      height: 90,
      x: 0,
      y: 0
    },
    nameBounds: {
      absX: 0,
      absY: 0,
      width: 100,
      height: 90,
      x: 0,
      y: 0
    }
  },
  [StType["SysML::Ellipse"]]: {
    ...blockOption,
    shapeKey: ShapeKey.Ellipse,
    subShapeType: SubShapeType.PathShape,
    bounds: {
      absX: 0,
      absY: 0,
      width: 120,
      height: 70,
      x: 0,
      y: 0
    },
    nameBounds: {
      absX: 0,
      absY: 0,
      width: 120,
      height: 70,
      x: 0,
      y: 0
    }
  },
  [StType["SysML::Circle"]]: {
    ...blockOption,
    shapeKey: ShapeKey.Circle,
    subShapeType: SubShapeType.PathShape,
    bounds: {
      absX: 0,
      absY: 0,
      width: 90,
      height: 90,
      x: 0,
      y: 0
    },
    nameBounds: {
      absX: 0,
      absY: 0,
      width: 90,
      height: 90,
      x: 0,
      y: 0
    }
  },
  [StType["SysML::RightAngle"]]: {
    ...blockOption,
    shapeKey: ShapeKey.RightAngle,
    subShapeType: SubShapeType.PathShape,
    bounds: {
      absX: 0,
      absY: 0,
      width: 100,
      height: 80,
      x: 0,
      y: 0
    },
    nameBounds: {
      absX: 0,
      absY: 0,
      width: 100,
      height: 80,
      x: 0,
      y: 0
    }
  }
}