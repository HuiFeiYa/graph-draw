import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type {
  ShapeKey,
  ShapeType,
  StyleObject,
  SubShapeType,
} from '@hfdraw/types';
import { BoundsTransformer } from 'src/utils/Transformer';
import { Point } from 'src/utils/Point';
import { ShapeOption } from 'src/types/model.type';
import { ResException } from 'src/utils/http/ResException';
import { ApiCode } from 'src/utils/http/ApiCode';
import { getUid } from 'src/utils/common';
import { cloneDeep } from 'lodash';
import { Bounds } from 'src/types/Bounds';
@Entity({
  name: 'shape',
})
export class ShapeEntity {
  @PrimaryGeneratedColumn()
  id_: number;

  @Column({
    type: String,
    comment: '图形id，参与序列化，项目内唯一标识，用于与其他图形，模型建立关联',
  })
  id: string;

  @Column({
    nullable: false,
    type: String,
    comment: '项目id',
  })
  projectId: string; // 项目id

  @Column({
    type: String,
    comment: '图形一级类型，决定了图形的数据结构',
  })
  shapeType: ShapeType;

  // @RelationId((shape:Shape) => shape.parent)
  @Column({
    type: String,
    nullable: true,
    default: '',
    comment: '父图形id',
  })
  parentId: string;
  @Column({
    type: String,
    comment: '图形二级类型，决定了对应的渲染组件',
  })
  subShapeType: SubShapeType;

  @Column({
    type: 'simple-json',
    nullable: true,
    comment: '图形边框',
    transformer: new BoundsTransformer(),
  })
  bounds: Bounds; // Bounds的json串
  @Column({
    type: 'simple-json',
    nullable: true,
    comment: '图形边框',
    transformer: new BoundsTransformer(),
  })
  nameBounds: Bounds; // Bounds的json串
  @Column({
    type: 'simple-json',
    nullable: true,
    comment: '针对整个shape样式对象',
  })
  style: StyleObject; // styleObject的json串
  @Column({
    type: 'boolean',
    default: 0,
  })
  isDelete: boolean;

  @Column({
    type: 'simple-json',
    nullable: true,
    comment: '路径的坐标点',
  })
  waypoint: Point[];


  @Column({
    type: String,
    nullable: false,
    comment: 'shape最细标识key',
  })
  shapeKey: ShapeKey;

  @Column({
    type: String,
    nullable: true,
    comment: '线的起点图形的id',
  })
  sourceId: string;

  @Column({
    type: String,
    nullable: true,
    comment: '线的终点图形的id',
  })
  targetId: string;

  @Column({
    type: String,
    nullable: true,
    comment: '代表的模型id',
  })
  modelId: string;

  @Column({
    type: String,
    nullable: true,
    comment: '代表的模型名称',
  })
  modelName: string;
  children:ShapeEntity[]
  boundsChanged:boolean
  nameBoundsChanged:boolean
  modelNameChanged: boolean
  styleChanged: boolean
  isDeleteChanged: boolean
  waypointChanged: boolean
  static fromOption(
    shapeOption: Partial<ShapeOption>,
    projectId: string,
  ) {
    if (!shapeOption) {
      throw new ResException(ApiCode.ERROR, 'shapeOption 缺失');
    }
    const shape = new ShapeEntity();
    shape.id = getUid();
    Object.assign(shape, cloneDeep(shapeOption));
    shape.projectId = projectId;
    return shape;
  }
}
