import { Change, SiderbarItemKey, StType, StyleObject, VertexType } from "@hfdraw/types";
import { IsArray, IsInt, IsNumber, IsString } from "class-validator";
import { Point } from "src/utils/Point";
export class BaseProjectDto {
  @IsString()
  projectId: string;

}
// 定义 DTO 类
export class SideBarDropDto {
    // @IsString()
    // diagramId: string;
    // {x: 95, y: 162}
    point: Point;
    @IsString()
    projectId: string;
    modelId: StType;
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

  export class ConnectShapeAndCreateDto extends BaseProjectDto {
    @IsString()
    sourceShapeId: string;
    
    @IsString()
    index: VertexType

    // 可以是 stType
    @IsString()
    modelId: StType;

    @IsArray()
    sourceConnection: [number, number]

    @IsArray()
    targetConnection: [number, number]
  }

  export class UndoDto extends BaseProjectDto {
    // changes: Change[]
    // desc?: string
    // // 序号，第几步， 从0开始
    // index: number
  }


  export class PointDto {
    @IsInt()
    x: number;
    @IsInt()
    y: number;
  }


  export class MoveEdgeDto extends BaseProjectDto {
    @IsString()
    shapeId: string
    @IsArray()
    waypoint: Point[]
  }

  export class UpdateStyleObj extends BaseProjectDto {
    styleObject: StyleObject
    @IsString()
    shapeId: string
  }