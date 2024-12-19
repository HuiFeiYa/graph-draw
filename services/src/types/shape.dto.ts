import { SiderbarItemKey, StType } from "@hfdraw/types";
import { IsArray, IsNumber, IsString } from "class-validator";
import { Point } from "src/utils/Point";
export class BaseProjectDto {
  @IsString()
  projectId: string;

}
// 定义 DTO 类
export class SideBarDropDto {
    @IsString()
    diagramId: string;
    // {x: 95, y: 162}
    point: Point;
    @IsString()
    projectId: string;
    sourceType: SiderbarItemKey;
    // @IsString()
    // targetShapeId: string;
  }
  
  export class FetchAllShapeDto extends BaseProjectDto {
  }
  export class MoveShapeDto extends BaseProjectDto {
    @IsArray()
    shapeIds: string[]

    @IsNumber()
    dx: number
  
    @IsNumber()
    dy: number
  }