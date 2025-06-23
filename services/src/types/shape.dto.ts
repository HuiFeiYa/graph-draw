import { Bounds, Change, EdgeMoveType, IPoint, RetrospectOption, SiderbarItemKey, StType, StyleObject, VertexType } from "@hfdraw/types";
import { IsArray, IsBoolean, IsInt, IsNumber, IsObject, IsString } from "class-validator";
import { Point } from "src/utils/Point";
import { ModelKey } from "./model.type";
import { Model } from "src/entities/model.entity";
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
    stType: StType;
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
    styleObject: StyleObject
  }

  export class UpdateStyleObj extends BaseProjectDto {
    styleObject: StyleObject
    @IsString()
    shapeId: string
  }


  export class CreateMindMapRectDto extends BaseProjectDto {
    @IsString()
    shapeId: string
    @IsString()
    diagramId: string
    depth: number
  }


  export type ToCreateShapeModelTreeType = {
    shapeId: string,
    width: number,
    height: number,
    cx: number,
    cy: number,
    retrospectOption: RetrospectOption,
    children: ToCreateShapeModelTreeType[]
    modelName?:string
  };

  export class SaveTextDto extends BaseProjectDto {
    @IsString()
    shapeId: string
    @IsString()
    text: string
  }

  export class UpdateShapeBoundsDto extends BaseProjectDto {
    @IsObject()
    bounds: any;

    @IsString()
    shapeId: string;
  }

  export class ExpandShapeDto extends BaseProjectDto {    @IsString()
    shapeId: string
    @IsBoolean()
    expand: boolean
  }

  export class ShapeResizeDto extends BaseProjectDto {
    bounds: Bounds
  
    @IsString()
    shapeId: string
  }


  export class GetMinimumBoundsDto extends BaseProjectDto {

  
    @IsString()
    shapeId: string
  
    @IsNumber()
    vertexType: VertexType
  
  }


  export class ChangeRelationshipEndsDto extends BaseProjectDto  {
    waypoint: IPoint[]
    shapeId: string
    shapeSourceId?: string
    shapeTargetId?: string
    moveType?: EdgeMoveType
  }