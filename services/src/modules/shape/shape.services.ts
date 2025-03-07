import { Injectable } from '@nestjs/common';
import {
  BaseProjectDto,
  ConnectShapeAndCreateDto,
  CreateMindMapRectDto,
  FetchAllShapeDto,
  MoveEdgeDto,
  MoveShapeDto,
  PointDto,
  SaveTextDto,
  SideBarDropDto,
  ToCreateShapeModelTreeType,
  UpdateStyleObj,
} from 'src/types/shape.dto';
import { SidebarModel } from '../models/SidebarModel';
import { InjectRepository } from '@nestjs/typeorm';
import { ShapeEntity } from 'src/entities/shape.entity';
import { EntityTarget, FindManyOptions, In, Repository } from 'typeorm';
import { WsService } from '../socket/WsService';
import { WsMessageType } from 'src/types/common';
import { Change, ChangeType, StType, StepType, StyleObject, SubShapeType, VertexType } from '@hfdraw/types';
import { CurrentStepService } from '../currentStep/currentStepService';
import { StepService } from '../step/stepService';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseService } from '../common/BaseService';
import { Point } from 'src/utils/Point';
import { shapeFactory } from '../models/ShapeFactory';
import { shapeUtil } from 'src/utils/shape/ShapeUtil';
import { ConnectModel } from '../models/ConnectModel';
import { MoveManager } from './shapeBusiness/MoveManager';
import { MindMapManager } from './shapeBusiness/MindMapManager';
import {  getTextSize } from '@hfdraw/utils';
@Injectable()
export class ShapeService  extends BaseService{
  constructor(
    @InjectRepository(ShapeEntity)
    private shapeRepository: Repository<ShapeEntity>,
    private readonly wsService: WsService, // 注入 WsService
    private readonly currentStepService: CurrentStepService,
    private readonly stepService: StepService
  ) {
    super();
  }
  async sideBarItemDrop(dto: SideBarDropDto) {
    return await this.shapeRepository.manager.transaction(async manager => {
      const options = {
        projectId: dto.projectId,
        point: dto.point,
        stType: dto.modelId
      };
      const sideBar = new SidebarModel(options);
      await sideBar.run();
      // const res = await this.shapeRepository.save([...sideBar.createdShapes]);
      const res = await manager.save(ShapeEntity, [...sideBar.createdShapes]);
      const changes: Change[] = [...sideBar.createdShapes].map(s => {
        const v: Change = {
          type: ChangeType.INSERT,
          newValue: JSON.stringify(s),
          projectId: dto.projectId,
          shapeId: s.id_
        }
        return v;
      })
      await this.stepService.initStep({projectId:dto.projectId, changes});
      return res
    })
  }
  async getDiagramAllShape(dto: FetchAllShapeDto) {
    const res = await this.shapeRepository.find({
      where: {
        projectId: dto.projectId,
        isDelete: false
      },
    });
    return res;
  }
  async moveShape(dto: MoveShapeDto) {
    const { shapeMap } = await this.getShapeTree(dto.projectId);
    const updateShapeSet = new Set<ShapeEntity>();
    MoveManager.updateShapes(shapeMap, dto, updateShapeSet);
    MoveManager.updateEdgeShapes(shapeMap, dto, updateShapeSet);
    // 将 Set 转换为数组，并调用 shapeRepository 的 bulkUpdate 方法进行批量更新
    let changes:Change[] = []
    if (updateShapeSet.size > 0) {
      const updatedShapesArray = Array.from(updateShapeSet);
      changes = await this.bulkUpdateShapes( dto.projectId,updatedShapesArray);
      console.log('res:',changes)
    }
    return changes;
    
  }
  async getShapeTree(projectId: string) {
    const query: FindManyOptions<ShapeEntity> = {
      where: { projectId, isDelete: false },
    };
    const shapes = await this.shapeRepository.find(query);
    const shapeMap = new Map<string, ShapeEntity>();
    shapes.forEach((shape) => {
      shapeMap.set(shape.id, shape);
    });
    return {
      shapeMap,
      shapes,
    };
  }
  // 批量更新逻辑
  async bulkUpdateShapes(projectId: string,shapes: ShapeEntity[]): Promise<Change[]> {
    // 使用 Promise.all 并行执行所有更新操作
    const changes: Change[] = []
    const updatePromises = shapes.map(async (shape) => {
      // 提取要更新的字段和值
      // const partialEntity: Partial<ShapeEntity> = {
      //   bounds: {
      //     ...shape.bounds,
      //     x: shape.bounds.x,
      //     y: shape.bounds.y,
      //     absX: shape.bounds.absX,
      //     absY: shape.bounds.absY,
      //   },
      // };
 
      const partialEntity = shapeUtil.pickChange(shape);
     // 如果没改变不需要更新 --todo
      if (shape.subShapeType === SubShapeType.CommonEdge) {
        partialEntity.waypoint = shape.waypoint;
      }
      // 根据 shape.id 更新对应的记录
      const change = await this.updateEntity(projectId,this.shapeRepository.manager, ShapeEntity, shape.id_, partialEntity)
      changes.push(change);
      // return this.shapeRepository.update({ id: shape.id }, partialEntity);
    });

    await Promise.all(updatePromises);
    return changes;
  }

  /**
   * 更新所有变化的属性到数据库里
   * @param affectedShapes
   * @returns
   */
  async updateShapeChanges(affectedShapes: ShapeEntity[] ) {
    if (affectedShapes.length === 0) return;
    const updatePromises = affectedShapes.map(async it => {

      const partialEntity: Partial<ShapeEntity> = shapeUtil.pickChange(it);
      const change = await this.updateEntity(it.projectId,this.shapeRepository.manager, ShapeEntity, it.id_, partialEntity)

      return change;
    });
    
    const changes = await Promise.all(updatePromises);
    return changes;

  }

  async connectShapeAndCreate(dto: ConnectShapeAndCreateDto) {
    return await this.shapeRepository.manager.transaction(async manager => {
      const { sourceShapeId, projectId, index, modelId: stType, sourceConnection, targetConnection } = dto;
      const shape = await this.shapeRepository.findOne({
        where: {
          id: sourceShapeId
        },
        select: ['bounds', 'id']
      })
      if (!shape) {
        throw new Error('未找到源图形')
      }
      /** 创建 target Shape */
      const {shapePoint, targetPoint, sourcePoint} = shapeUtil.getTargetShapePoint(shape.bounds, stType, index)
      const options = {
        projectId,
        stType,
        point: shapePoint
      }
      const sideBar = new SidebarModel(options);
      await sideBar.run();
      const targetShape = [...sideBar.createdShapes][0]
      /** 创建线 */
      const styleObj: StyleObject = {
        sourceConnection,
        targetConnection
      }
      const connectModel = new ConnectModel(projectId, StType['SysML::Association'], [sourcePoint,targetPoint],shape,targetShape, styleObj);
      await connectModel.connectShape()
      const toCreateShapes = [...sideBar.createdShapes, ...connectModel.createdShapes];
      const res = await manager.save(ShapeEntity, toCreateShapes)
      return res;
    })
  }
  async clearProject(dto: BaseProjectDto) {
    const shapesIds = await this.shapeRepository.find({where: {projectId: dto.projectId}, select: ['id']})
    const ids = shapesIds.map(item => item.id);
    await this.shapeRepository.update({id: In(ids)}, {isDelete: true});
  }
  // async createConnectTargetShape(dto: ConnectShapeAndCreateDto) {
  //   const { sourceShapeId, projectId, index, modelId: stType } = dto;
  //   const shape = await this.shapeRepository.findOne({
  //     where: {
  //       id: sourceShapeId
  //     },
  //     select: ['bounds', 'id']
  //   })
  //   const {shapePoint, targetPoint, sourcePoint} = shapeUtil.getTargetShapePoint(shape.bounds, stType, index)
  //   const options = {
  //     projectId,
  //     stType,
  //     point: shapePoint
  //   }
  //   const sideBar = new SidebarModel(options);
  //   await sideBar.run();
  //   return sideBar.createdShapes;
  // }
  async createConnectEdge(dto: ConnectShapeAndCreateDto, waypoint: PointDto[]) {
    const { sourceShapeId, projectId, index, modelId: stType } = dto;
  }

  async moveEdge(dto: MoveEdgeDto) {
    const shape = await this.shapeRepository.findOne({where: {
      id: dto.shapeId
    }});
    const partialEntity: Partial<ShapeEntity> = {
      waypoint: dto.waypoint,
      style: {
        ...shape.style,
        sourceConnection: dto.styleObject.sourceConnection,
        targetConnection: dto.styleObject.targetConnection
      }
    }
    const change = await this.updateEntity(dto.projectId, this.shapeRepository.manager, ShapeEntity, shape.id_, partialEntity)

    return [change];
  }

  async updateShapeStyle(dto: UpdateStyleObj) {
    const shape = await this.shapeRepository.findOne({
      where: {
        id: dto.shapeId,
        projectId: dto.projectId
      }
    })
    const partialEntity:Partial<ShapeEntity> = {
      style: {
        ...shape.style,
        ...dto.styleObject
      }
    }
    const change = await this.updateEntity(dto.projectId, this.shapeRepository.manager, ShapeEntity, shape.id_, partialEntity);
    return [change];
  }
 
  async createMindMapRect(dto:CreateMindMapRectDto) {
    return this.shapeRepository.manager.transaction(async manager => {
      const { projectId, depth, shapeId} = dto;
      const { shapeMap } = await this.getShapeTree(projectId);
      const sourceShape = shapeMap.get(shapeId);
      const createShape = await MindMapManager.createShape(dto, shapeMap)
      // 更新 sourceShape 的追溯关联选项
      const partialEntity: Partial<ShapeEntity> = {
        style: {
          ...(createShape.style || {}),
          retrospectOption: {
            ...sourceShape.style.retrospectOption,
            relationTypes: [...sourceShape.style.retrospectOption.relationTypes, {id: createShape.modelId, shapeId: createShape.id}]
          },
        }
      }
      
      await manager.save(ShapeEntity, [createShape]);
      shapeMap.set(createShape.id, createShape);
      const changes: Change[] = [createShape].map(s => {
        const v: Change = {
          type: ChangeType.INSERT,
          newValue: JSON.stringify(s),
          projectId: dto.projectId,
          shapeId: s.id_
        }
        return v;
      })
      const change = await this.updateEntity(projectId,this.shapeRepository.manager, ShapeEntity, sourceShape.id_, partialEntity)
      sourceShape.style = partialEntity.style;
      changes.push(change);
      const updateShapes = await MindMapManager.calcTreePosition(sourceShape, shapeMap)
      if (updateShapes.size > 0) {
        const updatedShapesArray = Array.from(updateShapes);
        const updates = await this.bulkUpdateShapes( dto.projectId,updatedShapesArray);
        changes.push(...updates);
      }
      return changes;
    })
  }
  async saveText(dto:SaveTextDto) {
    return this.shapeRepository.manager.transaction(async manager => {
      const { shapeId, text, projectId } = dto;
      const shape = await manager.findOne(ShapeEntity, { where: { id: shapeId, projectId } });
      shape.modelName = text;
      shape.modelNameChanged = true;
      const h = getTextSize(text,  shape.style.fontSize,shape.nameBounds.width).height;
      // 自动更新 shape 的高度
      if (Math.abs(h  -  shape.nameBounds.height)> 5) {
        const diffH = h - shape.nameBounds.height;
        shape.bounds.height +=diffH
        shape.nameBounds.height = h;
        shape.boundsChanged = true;
        shape.nameBoundsChanged = true;
      }
      // await manager.save(shape);
      // return shape;
      const changes = await this.updateShapeChanges([shape])
      return changes;
    })
  }
  async test() {
    // return this.currentStepService.findStep();
  }
}
