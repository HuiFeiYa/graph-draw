import { SiderbarItemKey, VertexType } from "@hfdraw/types";
export interface SideBarDropDto {
    diagramId: string;
    // {x: 95, y: 162}
    point: {x:number,y:number};
    projectId: string;
    modelId: string;
  }
  
  export interface MoveShapeDto {
    projectId: string;

    shapeIds: string[]

    dx: number
  
    dy: number
  }

  export interface ConnectShapeAndCreateDto {
    projectId: string;
    sourceShapeId: string;
    index: VertexType
    // 可以是 stType
    modelId: string;
  }


