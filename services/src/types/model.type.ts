import { MetaclassType, SiderbarItemKey, StType } from '@hfdraw/types';
import { ShapeEntity } from 'src/entities/shape.entity';
import { Point } from 'src/utils/Point';

export interface createModelOptions {
  metaclass: MetaclassType;
  parentId: string;
  projectId: string;
}

export type ModelKey = MetaclassType | StType
export class  ShapeOption extends  ShapeEntity {

}

export interface SidebarOptions {
  projectId: string
  diagramId: string
  // shapeParentId: string
  point: Point;
  sourceType: SiderbarItemKey;
}