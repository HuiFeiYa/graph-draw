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
  MoveSegmentDto,
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
import { Bounds, Change, ChangeType, ShapeType, StType, StepType, StyleObject, SubShapeType, VertexType } from '@hfdraw/types';
import { StepService } from '../step/stepService';
import { BaseService } from '../common/BaseService';
import { shapeUtil } from 'src/utils/shape/ShapeUtil';
import { ConnectModel } from '../models/ConnectModel';
import { MoveManager } from './shapeBusiness/MoveManager';
import {  getTextSize } from '@hfdraw/utils';
import { StepManager } from 'src/utils/StepManager';
import { clone, cloneDeep } from 'lodash';
import { equalBounds } from 'src/utils/common';
import { ResizeUtil } from 'src/utils/ResizeUtil';
import { MinBoundsUtil } from 'src/utils/shape/MinBoundsUtil';
import { waypointModel } from 'src/utils/WaypointModel';
import { generateRectConnectRoute } from '@hfdraw/elbow';
import { EdgeWaypointUtil } from 'src/utils/EdgeWaypointUtil';
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
      const sideBar = new SidebarModel(this.stepManager, options);
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
    // 新增：自动调整所有相关联的边线
    for (const shape of updateShapeSet) {
      if (shape.shapeType !== ShapeType.Edge) {
        const updatedEdges = await EdgeWaypointUtil.updateConnectedEdgesForShape(shape, this.stepManager, shapeMap);
        updatedEdges.forEach(edge => updateShapeSet.add(edge));
      }
    }
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
    if (!equalBounds(oldBounds, newBounds)) {
      affectedShapes.add(shape);
      shape.boundsChanged = true;
    }
    const resizeUtil = new ResizeUtil(shapeMap);
    resizeUtil.expandParent(shape);
    resizeUtil.affectedShapes.forEach(it => {
      affectedShapes.add(it);
    });

    // 重新生成与该图形相关的折线
    const updatedEdges = await this.updateConnectedEdgesForResize(shape, oldBounds, newBounds);
    updatedEdges.forEach(edge => {
      affectedShapes.add(edge);
    });

    await this.updateShapeChanges(affectedShapes);
    return Array.from(affectedShapes);
  }

  async getMinBounds(minimumBounds: GetMinimumBoundsDto) {
    const { shapeMap } = await this.getShapeTree(minimumBounds.projectId);
    const minBoundsUtil = new MinBoundsUtil(shapeMap);
    return minBoundsUtil.getMinBounds(shapeMap.get(minimumBounds.shapeId), minimumBounds.vertexType);
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
    const sideBar = new SidebarModel(this.stepManager, options);
    await sideBar.run();
    const targetShape = [...sideBar.createdShapes][0]
    /** 创建线 */
    const styleObj: StyleObject = {
      sourceConnection,
      targetConnection
    }
    const connectModel = new ConnectModel(this.stepManager, projectId, StType['SysML::Association'], [sourcePoint,targetPoint],shape,targetShape, styleObj);
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
    if (dto.styleObject && Object.keys(dto.styleObject).length > 0) {
      shape.style = {
        ...shape.style,
        ...dto.styleObject
      };
      shape.styleChanged = true;
    }
    // 处理sourceId的变更，包括设置为null的情况
    if (dto.hasOwnProperty('sourceId')) {
      shape.sourceId = dto.sourceId;
      shape.sourceIdChanged = true;
    }
    // 处理targetId的变更，包括设置为null的情况
    if (dto.hasOwnProperty('targetId')) {
      shape.targetId = dto.targetId;
      shape.targetIdChanged = true;
    }
    await this.updateShapeChanges([shape]);
    return [shape];
  }

  async moveSegment(dto: MoveSegmentDto) {
    const shape = await this.stepManager.shapeRep.findOne({where: {
      id: dto.shapeId
    }});
    shape.waypoint = dto.waypoint;
    shape.waypointChanged = true;
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
      ...dto.styleObject,
      arrowStyle: {
        ...(shape.style.arrowStyle || {}),
        ...(dto.styleObject.arrowStyle || {})
      },
    };
    shape.styleChanged = true;
    await this.updateShapeChanges([shape]);
    return [shape];
  }
 
  async createMindMapRect(dto:CreateMindMapRectDto) {
  //   const { projectId, shapeId} = dto;
  //   const { shapeMap } = await this.getShapeTree(projectId);
  //   const sourceShape = shapeMap.get(shapeId);
  //   const createShape = await MindMapManager.createShape(dto, shapeMap)
  //   await this.addEntities(ShapeEntity, [createShape]);
  //   shapeMap.set(createShape.id, createShape);
  //   MindMapManager.addRetrospectOption(sourceShape, createShape.id);
  //   const affectedShapes = new Set<ShapeEntity>([sourceShape]);
  //   const updateShapes = await MindMapManager.calcTreePosition(sourceShape, shapeMap)
  //   if (updateShapes.size > 0) {
  //     updateShapes.forEach(shape => affectedShapes.add(shape));
  //   }
  //   await this.updateShapeChanges(affectedShapes);
  //   return Array.from(affectedShapes);
  }
  async updateMindMapRectChildrenPosition(dto: {shapeId: string; projectId:string}) {
    // const {projectId, shapeId} = dto;
    // const { shapeMap } = await this.getShapeTree(projectId);
    // const sourceShape = shapeMap.get(shapeId);
    // const updateShapes = await MindMapManager.calcTreePosition(sourceShape, shapeMap)
    // await this.updateShapeChanges(updateShapes);
    // return Array.from(updateShapes);
  }
  async updateConnectedEdgesForResize(shape: ShapeEntity, oldBounds: any, newBounds: any): Promise<ShapeEntity[]> {
    // 使用公共的边线更新逻辑
    return await EdgeWaypointUtil.updateConnectedEdgesForShape(shape, this.stepManager);
  }

  async updateEdgeWaypointsForShapeHeightChange(shape, oldHeight, newHeight) {
    const dy = newHeight - oldHeight;
    // 查找所有与 shape 相连的 edge
    const edges = await this.stepManager.shapeRep.find({
      where: [
        { sourceId: shape.id },
        { targetId: shape.id }
      ]
    });
    const updatedEdges = [];
    for (const edge of edges) {
      let isSource = edge.sourceId === shape.id;
      let connection = isSource ? edge.style?.sourceConnection : edge.style?.targetConnection;
      if (!connection || !edge.waypoint || edge.waypoint.length === 0) continue;
      const idx = isSource ? 0 : edge.waypoint.length - 1;

      if (connection[1] === 1) {
        // 底部连接，y整体平移
        edge.waypoint[idx].y += dy;
        edge.waypointChanged = true;
        updatedEdges.push(edge);
      } else if (connection[0] === 0 || connection[0] === 1) {
        // 获取最新的 source/target shape 和 connection
        const sourceShape = isSource ? shape : await this.stepManager.shapeRep.findOne({ where: { id: edge.sourceId } });
        const targetShape = !isSource ? shape : await this.stepManager.shapeRep.findOne({ where: { id: edge.targetId } });
        const sourceRect =  {
          bounds: sourceShape.bounds,
          connection: edge.style?.sourceConnection
        }
        const targetRect = {
          bounds: targetShape.bounds,
          connection: edge.style?.targetConnection
        }

        // 生成新的折线路径
        const newWaypoint = generateRectConnectRoute(sourceRect, targetRect, { routeType: 'elbow' });
        edge.waypoint = newWaypoint;
        updatedEdges.push(edge);
      }
    }
    return updatedEdges;
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
    const oldHeight = shape.bounds.height;
    // 当文案输入导致内容超出，则变更高度
    let edgesToUpdate = [];
    if (height > shape.bounds.height) {
      shape.bounds.height =  height;
      shape.nameBounds.height = ceilH;
      shape.boundsChanged = true;
      shape.nameBoundsChanged = true;
      // 高度变化时，自动调整相关连线
      edgesToUpdate = await this.updateEdgeWaypointsForShapeHeightChange(shape, oldHeight, height);
    }
    await this.updateShapeChanges([shape, ...edgesToUpdate]);
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
  /**
   * 批量添加 ShapeEntity，并自动记录 changes
   */
  async addShapeChanges(affectedShapes: ShapeEntity[] | Set<ShapeEntity>): Promise<ShapeEntity[]> {
    if (affectedShapes instanceof Set) {
      affectedShapes = Array.from(affectedShapes);
    }
    if (!affectedShapes || affectedShapes.length === 0) return [];
    // 生成 changes
    const shapesToAdd = affectedShapes.map(it => {
      // 这里可以 pickChange 或直接返回对象本身，视业务需求
      // 通常新增时直接用原对象
      return it;
    });
    // 批量插入
    return this.addEntities(ShapeEntity, shapesToAdd);
  }
  async batchUpdateShapeStyle(projectId: string, shapeIds: string[], newStyle: any) {
    const shapes = await this.stepManager.shapeRep.find({
      where: { projectId, id: In(shapeIds) }
    });
    for (const shape of shapes) {
      shape.style = {
        ...shape.style,
        ...newStyle,
        arrowStyle: {
          ...(shape.style.arrowStyle || {}),
          ...(newStyle.arrowStyle || {})
        },
      };
      shape.styleChanged = true;
    }
    const project = await this.stepManager.projectRep.findOne({ where: { projectId } });
    if (project) {
      project.commonConfig.style = { ...project.commonConfig.style, ...newStyle };
      await this.stepManager.projectRep.save(project);
    }
    await this.updateShapeChanges(shapes);
    return { success: true, updated: shapes.length };
  }
  
  async test() {
    // return this.currentStepService.findStep();
  }

  async moveZIndexUp(dto: { projectId: string; shapeId: string }) {
    const { shapeMap, shapes } = await this.getShapeTree(dto.projectId);
    const shape = shapeMap.get(dto.shapeId);
    if (!shape) throw new Error('未找到指定图形');
    // 找到比当前 zIndex 小且最近的 shape
    let minDiff = Infinity;
    let targetShape: ShapeEntity | null = null;
    for (const s of shapes) {
      if (s.id !== shape.id && s.zIndex > shape.zIndex && (s.zIndex - shape.zIndex) < minDiff) {
        minDiff = s.zIndex - shape.zIndex;
        targetShape = s;
      }
    }
    if (targetShape) {
      const temp = shape.zIndex;
      shape.zIndex = targetShape.zIndex;
      targetShape.zIndex = temp;
      shape.zIndexChanged = true;
      targetShape.zIndexChanged = true;
      await this.updateShapeChanges([shape, targetShape]);
    }
    return shape;
  }

  async moveZIndexDown(dto: { projectId: string; shapeId: string }) {
    const { shapeMap, shapes } = await this.getShapeTree(dto.projectId);
    const shape = shapeMap.get(dto.shapeId);
    if (!shape) throw new Error('未找到指定图形');
    // 找到比当前 zIndex 大且最近的 shape
    let minDiff = Infinity;
    let targetShape: ShapeEntity | null = null;
    for (const s of shapes) {
      if (s.id !== shape.id && s.zIndex < shape.zIndex && (shape.zIndex - s.zIndex) < minDiff) {
        minDiff = shape.zIndex - s.zIndex;
        targetShape = s;
      }
    }
    if (targetShape) {
      const temp = shape.zIndex;
      shape.zIndex = targetShape.zIndex;
      targetShape.zIndex = temp;
      shape.zIndexChanged = true;
      targetShape.zIndexChanged = true;
      await this.updateShapeChanges([shape, targetShape]);
    }
    return shape;
  }

  async moveZIndexToTop(dto: { projectId: string; shapeId: string }) {
    const { shapeMap, shapes } = await this.getShapeTree(dto.projectId);
    const shape = shapeMap.get(dto.shapeId);
    if (!shape) throw new Error('未找到指定图形');
    const maxZIndex = Math.max(...shapes.map(s => s.zIndex));
    shape.zIndex = maxZIndex + 1;
    shape.zIndexChanged = true;
    await this.updateShapeChanges([shape]);
    return shape;
  }

  async moveZIndexToBottom(dto: { projectId: string; shapeId: string }) {
    const { shapeMap, shapes } = await this.getShapeTree(dto.projectId);
    const shape = shapeMap.get(dto.shapeId);
    if (!shape) throw new Error('未找到指定图形');
    const minZIndex = Math.min(...shapes.map(s => s.zIndex));
    shape.zIndex = minZIndex - 1;
    shape.zIndexChanged = true;
    await this.updateShapeChanges([shape]);
    return shape;
  }
}
