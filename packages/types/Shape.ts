import { Bounds, IBounds, IPoint } from "./Bounds";
import { ShapeKey, ShapeType, SubShapeType } from "./ShapeType";
import { StyleObject } from "./Style";

export interface Shape {
    id:string;
  
    id_: number;
  
    parentId: string | null;
    bounds: Bounds;
    keywords:string[]
  
    showKeywords:boolean
  
    keywordsBounds:IBounds
    // name:string
    names:{
      prefix:string // 显示的前缀字符
      [p:string]:string
    }
  
    shapeType: ShapeType;
    subShapeType: SubShapeType
    // graph:GraphModel
  
    showIcon : boolean
    icon:string
  
    projectId:string
  
    diagramId:string
  
    style:StyleObject
  
    shapeKey:ShapeKey
  
    // itemRange:SwimlaneItemRange
  
    // cols:number[]
  
    // rows:number[]
    visibleCompartments: string[]
  
    nameBounds:IBounds
  
    showName:boolean
    svgPath:string
    waypoint:IPoint[]
  
    sourceId: string;
    targetId: string;
  
    name:string
  
    modelId:string
  
    modelName:string

    version: number;
  
    // direction:Direction
  
  }