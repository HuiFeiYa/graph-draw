import { Injectable } from '@nestjs/common';
import {
  FetchAllShapeDto,
  MoveShapeDto,
  SideBarDropDto,
} from 'src/types/shape.dto';
import { SidebarModel } from '../models/SidebarModel';
import { InjectRepository } from '@nestjs/typeorm';
import { ShapeEntity } from 'src/entities/shape.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { WsService } from '../socket/WsService';
import { WsMessageType } from 'src/types/common';
import { ChangeType } from '@hfdraw/types';

@Injectable()
export class ShapeService {
  constructor(
    @InjectRepository(ShapeEntity)
    private shapeRepository: Repository<ShapeEntity>,
    private readonly wsService: WsService, // 注入 WsService
  ) {}
  async sideBarItemDrop(dto: SideBarDropDto) {
    const options: SideBarDropDto = {
      projectId: dto.projectId,
      diagramId: dto.diagramId,
      point: dto.point,
      sourceType: dto.sourceType,
      // targetShapeId:
    };
    const sideBar = new SidebarModel(options);
    await sideBar.run();
    const res = await this.shapeRepository.save([...sideBar.createdShapes]);
    this.wsService.sendToSubscribedClient(dto.projectId, {
      type: WsMessageType.step,
      data: {
        projectId: dto.projectId,
        changes: res.map((item) => {
          return {
            type: ChangeType.INSERT,
            newValue: JSON.stringify(item),
            projectId: dto.projectId,
          };
        }),
      },
    });
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
      const res = await this.bulkUpdateShapes(updatedShapesArray);
      console.log('res:',res)
      this.wsService.sendToSubscribedClient(dto.projectId, {
        type: WsMessageType.step,
        data: {
          projectId: dto.projectId,
          changes: updatedShapesArray.map((item) => {
            return {
              type: ChangeType.UPDATE,
              newValue: JSON.stringify(item),
              projectId: dto.projectId,
            };
          }),
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
  async bulkUpdateShapes(shapes: ShapeEntity[]): Promise<void> {
    // 使用 Promise.all 并行执行所有更新操作
    const updatePromises = shapes.map((shape) => {
      // 提取要更新的字段和值
      const partialEntity = {
        bounds: {
          x: shape.bounds.x,
          y: shape.bounds.y,
          absX: shape.bounds.absX,
          absY: shape.bounds.absY,
        },
      };

      // 根据 shape.id 更新对应的记录
      return this.shapeRepository.update({ id: shape.id }, partialEntity);
    });

    await Promise.all(updatePromises);
  }
}
