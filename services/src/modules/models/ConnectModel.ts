import {
  Shape,
  ShapeKey,
  ShapeType,
  SiderbarItemKey,
  StType,
  StyleObject,
  siderbarItemKeyToStTypeMap,
} from '@hfdraw/types';
import { PointDto } from 'src/types/shape.dto';
import { connectConfig } from '../shape/shapeConfig/connectConfig';
import { shapeFactory } from './ShapeFactory';
import { ShapeEntity } from 'src/entities/shape.entity';
import { merge } from 'lodash';
import { StepManager } from 'src/utils/StepManager';
import { shapeUtil } from 'src/utils/shape/ShapeUtil';

export class ConnectModel {
  public createdShapes: Set<ShapeEntity> = new Set();

  constructor(
    public stepManager: StepManager,
    public projectId: string,
    public stType: StType,
    public waypoint: PointDto[],
    public sourceShape: ShapeEntity,
    public targetShape: ShapeEntity,
    public style: StyleObject,
  ) {}

  async connectShape(): Promise<void> {
    await this.createShape();
  }

  async createShape() {
    const { projectId, stType } = this;
    const shapeOption = shapeFactory.getModelShapeOption(stType);
    const shape = ShapeEntity.fromOption(
      { ...shapeOption, style: { ...shapeOption.style, ...this.style } },
      projectId,
    );
    const project = await this.stepManager.projectRep.findOne({where: {projectId}});
    
    // 设置 zIndex 值
    if (project && project.commonConfig) {
        const currentMaxZIndex = project.commonConfig.maxZIndex || 0;
        shape.zIndex = currentMaxZIndex + 1;
        
        // 更新项目的 maxZIndex
        project.commonConfig.maxZIndex = shape.zIndex;
        await this.stepManager.projectRep.save(project);
    } else {
        // 如果没有项目配置，设置默认 zIndex
        shape.zIndex = 1;
    }
    
    // 标记 zIndex 变化
    shape.zIndexChanged = true;
    
    if (project) {  
      if (shape.shapeType === ShapeType.Edge) {
        shape.style = {
            ...shape.style,
            strokeColor: project.commonConfig?.style.strokeColor || 'rgba(21,71, 146,0.5)',
        }
      } else {      
        shape.style = {
              ...shape.style,
              ...(project.commonConfig?.style||{})
          }
      }
    }
    shapeUtil.initEdgeShape(
      this.sourceShape,
      this.targetShape,
      shape,
      this.waypoint,
    );
    this.createdShapes.add(shape);
  }
} 