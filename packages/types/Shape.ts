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

  export interface EdgeShape extends Shape {
    sourceId: string;
    targetId: string;
    waypoint: IPoint[];
  
    // closestParentId: string; // 最近的父图形， 两端的图形的最近的同一个父元素
    // sourceArrowType: string;
    // targetArrowType: string;
  
    svgPath:string;
    // sourcePoint: IPoint// 起点坐标，是图形的边界上的点
    // targetPoint: IPoint // 终点坐标 ，是图形的边界上的点
  
    style: StyleObject;
  
  }