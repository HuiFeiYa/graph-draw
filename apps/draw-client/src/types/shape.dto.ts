import { SiderbarItemKey } from "@hfdraw/types";
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


