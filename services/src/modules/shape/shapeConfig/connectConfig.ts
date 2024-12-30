import { ShapeKey, SiderbarItemKey } from "@hfdraw/types"

type ConnectConfigItem = {
    edgeKeys: SiderbarItemKey[],
    targetShapeKeys: (ShapeKey | "*")[],
    sourceShapeKeys: (ShapeKey | "*")[],
    // behavior: typeof ConnectBehavior
  }



  export const connectConfig: ConnectConfigItem[] = [
    {
        edgeKeys: [SiderbarItemKey.Aggregation],
        targetShapeKeys: [],
        sourceShapeKeys: []
    }
  ]


