import {
  Shape,
  ShapeKey,
  SiderbarItemKey,
  StType,
  StyleObject,
  siderbarItemKeyToStTypeMap,
} from '@hfdraw/types';
import { PointDto } from 'src/types/shape.dto';
import { connectConfig } from '../shape/shapeConfig/connectConfig';
import { shapeFactory } from './ShapeFactory';
import { shapeUtil } from 'src/utils/shape/ShapeUtil';
import { ShapeEntity } from 'src/entities/shape.entity';
import { merge } from 'lodash';

export class ConnectModel {
  createdShapes: Set<ShapeEntity> = new Set();

  constructor(
    public projectId: string,
    public stType: StType,
    public waypoint: PointDto[],
    public sourceShape: ShapeEntity,
    public targetShape: ShapeEntity,
    public style: StyleObject,
  ) {}
  // 受影响的图形（增删改的图形）
  // public createdShapes: Set<Shape>
  async connectShape(): Promise<void> {
    await this.createShape();
  }
  async createShape() {
    const { projectId, stType } = this;
    // const stType = siderbarItemKeyToStTypeMap[this.edgeKey];
    const shapeOption = shapeFactory.getModelShapeOption(stType);
    const shape = ShapeEntity.fromOption(
      { ...shapeOption, style: { ...shapeOption.style, ...this.style } },
      projectId,
    );
    shapeUtil.initEdgeShape(
      this.sourceShape,
      this.targetShape,
      shape,
      this.waypoint,
    );
    this.createdShapes.add(shape);
  }
}
