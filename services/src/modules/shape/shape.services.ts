import { Injectable } from '@nestjs/common';
import {
  BaseProjectDto,
  ChangeRelationshipEndsDto,
  ConnectShapeAndCreateDto,
  CreateMindMapRectDto,
  ExpandShapeDto,
  FetchAllShapeDto,
  GetMinimumBoundsDto,
  MoveEdgeDto,
  MoveShapeDto,
  PointDto,
  SaveTextDto,
  ShapeResizeDto,
  SideBarDropDto,
  ToCreateShapeModelTreeType,
  UpdateShapeBoundsDto,
  UpdateStyleObj,
} from 'src/types/shape.dto';
import { SidebarModel } from '../models/SidebarModel';
import { InjectRepository } from '@nestjs/typeorm';
import { ShapeEntity } from 'src/entities/shape.entity';
import { EntityTarget, FindManyOptions, In, Repository } from 'typeorm';
import { ShapeMap, WsMessageType } from 'src/types/common';
import { Bounds, Change, ChangeType, StType, StepType, StyleObject, SubShapeType, VertexType } from '@hfdraw/types';
import { StepService } from '../step/stepService';
import { BaseService } from '../common/BaseService';
import { shapeUtil } from 'src/utils/shape/ShapeUtil';
import { ConnectModel } from '../models/ConnectModel';
import { MoveManager } from './shapeBusiness/MoveManager';
import { MindMapManager } from './shapeBusiness/MindMapManager';
import {  getTextSize } from '@hfdraw/utils';
import { StepManager } from 'src/utils/StepManager';
import { clone, cloneDeep } from 'lodash';
import { equalBounds } from 'src/utils/common';
import { ResizeUtil } from 'src/utils/ResizeUtil';
import { MinBoundsUtil } from 'src/utils/shape/MinBoundsUtil';
import { waypointModel } from 'src/utils/WaypointModel';
@Injectable()
export class ShapeService  extends BaseService{
  private readonly stepService: StepService

  constructor(
    public stepManager: StepManager
  ) {
    super(stepManager);
  }
  async sideBarItemDrop(dto: SideBarDropDto) {
      const options = {
        projectId: dto.projectId,
        point: dto.point,
        stType: dto.stType
      };
      const sideBar = new SidebarModel(options);
      await sideBar.run();
     const res = await this.addEntities(ShapeEntity, [...sideBar.createdShapes]);
      return res
  }
  async getDiagramAllShape(dto: FetchAllShapeDto) {
    const res = await this.stepManager.shapeRep.find({
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
    if (updateShapeSet.size > 0) {
      const res = await this.updateShapeChanges(updateShapeSet);
      return res;
    }
    return [];
    
  }
  async getShapeTree(projectId: string, where?: Record<string, any>) {
    const query: FindManyOptions<ShapeEntity> = {
      where: { projectId,  ...(where ? where : {isDelete:false}) },
    };
    const shapes = await this.stepManager.shapeRep.find(query);
    const shapeMap = new Map<string, ShapeEntity>();
    shapes.forEach((shape) => {
      shapeMap.set(shape.id, shape);
    });
    return {
      shapeMap,
      shapes,
    };
  }
  async resizeShape(resizeDto: ShapeResizeDto,  shapeMap?:ShapeMap) {
    if (!shapeMap) {
      const shapeTree = await this.getShapeTree(resizeDto.projectId);
      shapeMap = shapeTree.shapeMap;
    }
    // const { shapeMap, diagramShape } = await this.getShapeTree(resizeDto.projectId, resizeDto.diagramId);
    const oldShapeMap = shapeUtil.cloneShapeMap(shapeMap, ['id',  'bounds', 'waypoint', 'style']);
    const shape = shapeMap.get(resizeDto.shapeId);
    const oldBounds = clone(shape.bounds);
    shape.bounds = { ...resizeDto.bounds };
    const newBounds = resizeDto.bounds;
    
    // 同步更新nameBounds，保持10px的边距
    if (shape.nameBounds) {
      shape.nameBounds = {
        ...shape.nameBounds,
        absX: newBounds.absX + shape.nameBounds.x,
        absY: newBounds.absY + shape.nameBounds.y,
        width: Math.max(0, newBounds.width - 20),
        height: Math.max(0, newBounds.height - 20),
      };
      shape.nameBoundsChanged = true;
    }
    let affectedShapes = new Set<ShapeEntity>();
    // const dx = newBounds.absX - oldBounds.absX; // 新的x坐标比旧的x坐标大多少
    // const dy = newBounds.absY - oldBounds.absY;
    // const dHeight = newBounds.height - oldBounds.height;
    // const dWidth = newBounds.width - oldBounds.width;
    // const dCenter = newBounds.absX + newBounds.width / 2 - (oldBounds.absX + oldBounds.width / 2);
    if (!equalBounds(oldBounds, newBounds)) {
      affectedShapes.add(shape);
      shape.boundsChanged = true;
    }
    const resizeUtil = new ResizeUtil(shapeMap);
    resizeUtil.expandParent(shape);
    resizeUtil.affectedShapes.forEach(it => {
      affectedShapes.add(it);
    });
    await this.updateShapeChanges(affectedShapes);
    return Array.from(affectedShapes);
  }

  async getMinBounds(minimumBounds: GetMinimumBoundsDto) {
    const { shapeMap } = await this.getShapeTree(minimumBounds.projectId);
    const minBoundsUtil = new MinBoundsUtil(shapeMap);
    return minBoundsUtil.getMinBounds(shapeMap.get(minimumBounds.shapeId), minimumBounds.vertexType);
  }
    /**
     * 更新重要的方法
   * 更新所有变化的属性到数据库里
   * @param affectedShapes
   * 不需要手动去生成 changes 了，只需要调用对应的 updateShapeChanges ，
   * 传入对应的  affectedShapes，并在上面标记了 ShapeUtil.ts 97-116 就会自动生成 changes
   * @returns
   */
    async updateShapeChanges(affectedShapes: ShapeEntity[] | Set<ShapeEntity>) {
      if (affectedShapes instanceof Set) {
        affectedShapes = Array.from(affectedShapes);
      }
      if (affectedShapes.length === 0) return;
  
      // const boundsChangedShapes = affectedShapes.filter(it => it.boundsChanged);
  
      const ids_ = affectedShapes.map(it => it.id_);
      const changes = affectedShapes.map(it => {
  
        const change: Partial<ShapeEntity> = shapeUtil.pickChange(it);
  
        return change;
      });
  
      await this.updateEntities(ShapeEntity, ids_, changes);
  
    }


  async connectShapeAndCreate(dto: ConnectShapeAndCreateDto) {
    const { sourceShapeId, projectId, index, modelId: stType, sourceConnection, targetConnection } = dto;
    const shape = await this.stepManager.shapeRep.findOne({
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
    const res = await this.addEntities(ShapeEntity, toCreateShapes)
    return res;
  }
  async clearShapes(dto: BaseProjectDto) {
    const shapes = await this.stepManager.shapeRep.find({where: {projectId: dto.projectId}});
    const affectedShapes = shapes.map(shape => {
      shape.isDelete = true;
      shape.isDeleteChanged = true;
      return shape;
    });
    await this.updateShapeChanges(affectedShapes);
    return affectedShapes;
  }


  async moveEdge(dto: MoveEdgeDto) {
    const shape = await this.stepManager.shapeRep.findOne({where: {
      id: dto.shapeId
    }});
    shape.waypoint = dto.waypoint;
    shape.waypointChanged = true;
    if (Object.keys(dto.styleObject).length > 0) {
      shape.style = {
        ...shape.style,
        ...dto.styleObject
      };
      shape.styleChanged = true;
    }
    if (dto.sourceId) {
      shape.sourceId = dto.sourceId;
      shape.sourceIdChanged = true;
    }
    if (dto.targetId) {
      shape.targetId = dto.targetId;
      shape.targetIdChanged = true;
    }
    await this.updateShapeChanges([shape]);
    return [shape];
  }

  async updateShapeStyle(dto: UpdateStyleObj) {
    const shape = await this.stepManager.shapeRep.findOne({
      where: {
        id: dto.shapeId,
        projectId: dto.projectId
      }
    })
    shape.style = {
      ...shape.style,
      ...dto.styleObject
    };
    shape.styleChanged = true;
    await this.updateShapeChanges([shape]);
    return [shape];
  }
 
  async createMindMapRect(dto:CreateMindMapRectDto) {
    const { projectId, shapeId} = dto;
    const { shapeMap } = await this.getShapeTree(projectId);
    const sourceShape = shapeMap.get(shapeId);
    const createShape = await MindMapManager.createShape(dto, shapeMap)
    await this.addEntities(ShapeEntity, [createShape]);
    shapeMap.set(createShape.id, createShape);
    MindMapManager.addRetrospectOption(sourceShape, createShape.id);
    const affectedShapes = new Set<ShapeEntity>([sourceShape]);
    const updateShapes = await MindMapManager.calcTreePosition(sourceShape, shapeMap)
    if (updateShapes.size > 0) {
      updateShapes.forEach(shape => affectedShapes.add(shape));
    }
    await this.updateShapeChanges(affectedShapes);
    return Array.from(affectedShapes);
  }
  async updateMindMapRectChildrenPosition(dto: {shapeId: string; projectId:string}) {
    const {projectId, shapeId} = dto;
    const { shapeMap } = await this.getShapeTree(projectId);
    const sourceShape = shapeMap.get(shapeId);
    const updateShapes = await MindMapManager.calcTreePosition(sourceShape, shapeMap)
    await this.updateShapeChanges(updateShapes);
    return Array.from(updateShapes);
  }
  async saveText(dto:SaveTextDto) {
    const { shapeId, text, projectId } = dto;
    const PADDING = 5;
    const shape = await this.stepManager.shapeRep.findOne({ where: { id: shapeId, projectId } });
    shape.modelName = text;
    shape.modelNameChanged = true;
    const h = getTextSize(text,  shape.style.fontSize,shape.nameBounds.width).height;
    const ceilH = Math.ceil(h);
    const height = ceilH + PADDING * 2
    // 当文案输入导致内容超出，则变更高度
    if (height > shape.bounds.height) {
      shape.bounds.height =  height;
      shape.nameBounds.height = ceilH;
      shape.boundsChanged = true;
      shape.nameBoundsChanged = true;
    }
    await this.updateShapeChanges([shape])
  }
  async expandShape(dto:ExpandShapeDto) {
    const { shapeId, projectId, expand } = dto;
    const shape = await this.stepManager.shapeRep.findOne({ where: { id: shapeId, projectId } });
    if (!shape) {
      throw new Error('展开图形不存在')
    }
    const shapeMap = (await this.getShapeTree(projectId, {})).shapeMap;
    shape.style.retrospectOption.expand = dto.expand;
    shape.styleChanged = true;
    const toUpdateShapeSet = new Set([shape]);
    // 更新子节点的展示状态
    this.updateShapeExpand(shape, toUpdateShapeSet, shapeMap, expand);
    await this.updateShapeChanges(toUpdateShapeSet)
    return Array.from(toUpdateShapeSet);
  }

  async updateShapeExpand(shape: ShapeEntity, toUpdateShapeSet: Set<ShapeEntity>, shapeMap:Map<string, ShapeEntity>, expand:boolean) {   
    shape.style.retrospectOption.relationTypes.forEach(item =>{
      const childShape = shapeMap.get(item.shapeId);
      /** 删除或者显示子节点 */
      childShape.isDelete = !expand;
      childShape.isDeleteChanged = true;
      toUpdateShapeSet.add(childShape)
      if (childShape.style.retrospectOption.relationTypes) {
        this.updateShapeExpand(childShape, toUpdateShapeSet, shapeMap, expand)
      }
    }) 
  }
  async updateShapeBounds(dto: UpdateShapeBoundsDto) {
    const shape = await this.stepManager.shapeRep.findOne({ where: { id: dto.shapeId, projectId: dto.projectId } });
    if (!shape) {
      throw new Error('未找到对应的图形')
    }
    shape.bounds = dto.bounds;
    shape.boundsChanged = true;
    await this.updateShapeChanges([shape]);
    return [shape];
  }
  async changeRelationshipEnds(dto: ChangeRelationshipEndsDto) {
    const shapeMap = (await this.getShapeTree(dto.projectId, {})).shapeMap;
    const edgeShape = shapeMap.get(dto.shapeId);
    if (dto.shapeSourceId) {
      edgeShape.sourceId = dto.shapeSourceId;
      edgeShape.sourceIdChanged = true;
    }
    if (dto.shapeTargetId) {
      edgeShape.targetId = dto.shapeTargetId;
      edgeShape.targetIdChanged = true;
    }
    const toUpdateShapes = new Set<ShapeEntity>();
    const affectedShapes = waypointModel.updateWaypoint(shapeMap, edgeShape, dto.waypoint);
    affectedShapes.forEach(it => {
      toUpdateShapes.add(it);
    })

    // 是有有其他线的两端是这条线edgeShape， 如果有的话要调整这些线
    const affects3 = waypointModel.adjustEdgeRelatedEdges(shapeMap, dto.projectId, edgeShape.id);
    affects3.forEach(it => {
      toUpdateShapes.add(it);
    })
    if (toUpdateShapes.size > 0) {
      await this.updateShapeChanges(toUpdateShapes);
    }
  }

  
  async test() {
    // return this.currentStepService.findStep();
  }
}
