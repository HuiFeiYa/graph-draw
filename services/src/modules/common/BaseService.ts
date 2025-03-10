import { Change, ChangeType } from "@hfdraw/types";
import { ShapeEntity } from "src/entities/shape.entity";
import { pickProp } from "src/utils/common";
import { EntityManager, EntityTarget } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class BaseService {
    async addEntityForUpdate(projectId: string,manager: EntityManager, target: EntityTarget<ShapeEntity>, id_:number, shape: ShapeEntity) {
        const change: Change = {
            type: ChangeType.INSERT,
            projectId,
            shapeId: id_
        }
        const partialEntity :QueryDeepPartialEntity<ShapeEntity> = {isDelete: false};
        await manager.update(target, id_, partialEntity);
        const newShape = Object.assign({}, shape,partialEntity )
        change.newValue = JSON.stringify(newShape); // 新的字段key-value
        return change;
    }
    /**
    * 记录step的变更方法 ，更新属性
    * @param target 实体的class
    * @param id_ 行id
    * @param partialEntity 更新的字段 {key:'val',key2:val2}
    * @returns
    */
    async updateEntity(projectId: string,manager: EntityManager, target: EntityTarget<ShapeEntity>, id_: number, partialEntity: QueryDeepPartialEntity<ShapeEntity>) {
        let oldEntity: ShapeEntity = await manager.getRepository(target).findOne({
             where: {
                id_
            } as any
        });
        let changeType =  ChangeType.UPDATE;
        if ('isDelete' in partialEntity ) {
            if (partialEntity.isDelete) {
                changeType = ChangeType.DELETE
            } else {
                return this.addEntityForUpdate(projectId, manager, target as EntityTarget<ShapeEntity>, id_, oldEntity as ShapeEntity)
            }
        }
        const change: Change = {
            // @ts-ignore
            type: changeType,
            projectId,
            shapeId: id_
        };
        const keys = Object.keys(partialEntity) as Array<keyof ShapeEntity>;;
        // let toSelectKeys = keys;
        
        if (!oldEntity) {
            oldEntity = {} as ShapeEntity;
        }
        oldEntity = pickProp(oldEntity, keys) as ShapeEntity; // 防止默认值导致额外字段
        keys.forEach((key:keyof ShapeEntity) => {
            if (oldEntity[key] === undefined) {
                // @ts-ignore
                oldEntity[key] = null;
            }
        });
        change.oldValue = JSON.stringify(oldEntity); // 老的字段key-value
        change.newValue = JSON.stringify(partialEntity); // 新的字段key-value
        await manager.update(target, id_, partialEntity);
        return change;
    }
    /**
     * 记录step的变更方法,插入元素
     * @param projectId 
     * @param manager 
     * @param target 
     * @param shape 
     * @returns 
     */
    async addEntity(projectId: string,manager: EntityManager, target: EntityTarget<ShapeEntity>, shape: ShapeEntity) {
        const change: Change = {
            type: ChangeType.INSERT,
            projectId,
            shapeId: shape.id_,
            newValue: null,
        }
        const saveShape = await manager.save(target, shape);
        change.shapeId = saveShape.id_;
        change.newValue = JSON.stringify(saveShape); //需要在保存后再设置 newValue值，否则不存在 _id 无法在客户端匹配对应的图形导致更新错误
        return change;
    }
    async addEntitys(manager: EntityManager, target: EntityTarget<ShapeEntity>, shapes: ShapeEntity[]) {
      const promises = await   shapes.map(async shape => {
            return await this.addEntity(shape.projectId, manager, target, shape);
        })
        const changes = await Promise.all(promises);
        return changes;
    }
}