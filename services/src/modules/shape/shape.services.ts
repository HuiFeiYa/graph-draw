import { Injectable } from '@nestjs/common';
import {
  FetchAllShapeDto,
  MoveShapeDto,
  SideBarDropDto,
} from 'src/types/shape.dto';
import { SidebarModel } from '../models/SidebarModel';
import { InjectRepository } from '@nestjs/typeorm';
import { ShapeEntity } from 'src/entities/shape.entity';
import { EntityTarget, FindManyOptions, Repository } from 'typeorm';
import { WsService } from '../socket/WsService';
import { WsMessageType } from 'src/types/common';
import { Change, ChangeType } from '@hfdraw/types';
import { CurrentStepService } from '../currentStep/currentStepService';
import { StepService } from '../step/stepService';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseService } from '../common/BaseService';

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
      const options: SideBarDropDto = {
        projectId: dto.projectId,
        diagramId: dto.diagramId,
        point: dto.point,
        sourceType: dto.sourceType,
        // targetShapeId:
      };
      const sideBar = new SidebarModel(options);
      await sideBar.run();
      // const res = await this.shapeRepository.save([...sideBar.createdShapes]);
      const res = await manager.save(ShapeEntity, [...sideBar.createdShapes]);
      const changes: Change[] = [...sideBar.createdShapes].map(s => {
        const v: Change = {
          type: ChangeType.INSERT,
          newValue: JSON.stringify(s),
          projectId: dto.projectId
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
      },
    });
    return res;
  }
  async moveShape(dto: MoveShapeDto) {
    const { shapeMap } = await this.getShapeTree(dto.projectId);
    const updateShapeSet = new Set<ShapeEntity>();
    dto.shapeIds.forEach((shapeId) => {
      const shape = shapeMap.get(shapeId);
      shape.bounds.x += dto.dx;
      shape.bounds.y += dto.dy;
      shape.bounds.absX += dto.dx;
      shape.bounds.absY += dto.dy;
      //   shape.boundsChanged = true;
      updateShapeSet.add(shape);
    });
    // 将 Set 转换为数组，并调用 shapeRepository 的 bulkUpdate 方法进行批量更新
    if (updateShapeSet.size > 0) {
      const updatedShapesArray = Array.from(updateShapeSet);
      const changes = await this.bulkUpdateShapes( dto.projectId,updatedShapesArray);
      console.log('res:',changes)
      await this.stepService.initStep({projectId: dto.projectId, changes})
      await this.wsService.sendToSubscribedClient(dto.projectId, {
        type: WsMessageType.step,
        data: {
          projectId: dto.projectId,
          changes
          //  updatedShapesArray.map((item) => {
          //   return {
          //     type: ChangeType.UPDATE,
          //     newValue: JSON.stringify(item),
          //     projectId: dto.projectId,
          //   };
          // }),
        },
      });
    }
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
      const partialEntity = {
        bounds: {
          ...shape.bounds,
          x: shape.bounds.x,
          y: shape.bounds.y,
          absX: shape.bounds.absX,
          absY: shape.bounds.absY,
        },
      };

      // 根据 shape.id 更新对应的记录
      const change = await this.updateEntity(projectId,this.shapeRepository.manager, ShapeEntity, shape.id_, partialEntity)
      changes.push(change);
      // return this.shapeRepository.update({ id: shape.id }, partialEntity);
    });

    await Promise.all(updatePromises);
    return changes;
  }

  async test() {
    // return this.currentStepService.findStep();
  }
}
