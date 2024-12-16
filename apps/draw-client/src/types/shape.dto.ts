import { SiderbarItemKey } from "@hfdraw/types";
export class SideBarDropDto {
    diagramId: string;
    // {x: 95, y: 162}
    point: {x:number,y:number};
    projectId: string;
    sourceType: SiderbarItemKey;
  }
  