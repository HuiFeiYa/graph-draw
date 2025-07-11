import { ShapeKey, ShapeType, SubShapeType } from "@hfdraw/types";
import { ShapeOption } from "src/types/model.type";

export const baseShapeOption:Partial<ShapeOption> = {
    shapeType: ShapeType.Symbol,
    subShapeType: SubShapeType.Block,
    shapeKey: undefined,
    style: {
        background: '#fff',
        strokeColor: "#ad9d85",
        fontSize: 14
    },
    bounds: { absX: 0, absY: 0, width: 100, height: 80, x: 0, y: 0 },
    nameBounds: { absX: 10, absY: 10, width: 80, height: 60, x: 10, y: 5 },
}


export const blockOption:Partial<ShapeOption> = {
    ...baseShapeOption,
    shapeType: ShapeType.Symbol,
    subShapeType: SubShapeType.Block,
    shapeKey: ShapeKey.Block,
    style: {
      ...baseShapeOption.style,
      background: '#fff',
      strokeColor: "rgba(21,71, 146,0.5)",
      strokeWidth: 2
    },
    bounds: { absX: 0, absY: 0, width: 100, height: 40, x: 0, y: 0 },
    nameBounds: { absX: 10, absY: 10, width: 80, height: 30, x: 10, y: 5 },
  };

  export const edgeOption: Partial<ShapeOption> = {
    ...baseShapeOption,
    shapeType: ShapeType.Edge,
    subShapeType: SubShapeType.CommonEdge,
    shapeKey: ShapeKey.Association,
    waypoint: [],
  
    style: {
      ...baseShapeOption.style,
      strokeColor: 'rgba(21,71, 146,0.5)',
      strokeWidth: 2,
      arrowStyle: {
        hasEnd: true,
        hasStart: false,
        fillEnd: 'none',
        fillStart: 'none',
      }
    }
  
  };

  export const  mindMapOption =  {
    ...baseShapeOption,
    style: {
      retrospectOption: {
        expand: true, // 默认展开
        shapeDepth: 1, // 默认一级
        parentNodeId: '', // 默认没有对应的父图形
        relationTypes: [] // 关联关系
      },
      borderRadius: 25,
      stroke: "#ad22c5",
      strokeWidth: 2,
      fontSize: 14
    },
    shapeType: ShapeType.Symbol,
    showKeywords: false,
    showIcon: true,
    icon: '',
    shapeKey: ShapeKey.MindMapShape,
    subShapeType: SubShapeType.MindMap,
    bounds: { absX: 0, absY: 0, width: 150, height: 50, x: 0, y: 0 },
    nameBounds: {
      absX: 10, absY: 10, width: 130, height: 30, x: 10, y: 5
    },
  }

  export const connectEdgeLength = 100;