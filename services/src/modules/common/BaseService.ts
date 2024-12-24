import { Change, ChangeType } from "@hfdraw/types";
import { pickProp } from "src/utils/common";
import { EntityManager, EntityTarget } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class BaseService {
    /**
    * 记录step的变更方法 ，更新属性
    * @param target 实体的class
    * @param id_ 行id
    * @param partialEntity 更新的字段 {key:'val',key2:val2}
    * @returns
    */
    async updateEntity<Entity>(projectId: string,manager: EntityManager, target: EntityTarget<Entity>, id_: number, partialEntity: QueryDeepPartialEntity<Entity>) {
        // rep.findOne
        const change: Change = {
            type:  ChangeType.UPDATE,
            projectId
        };
        const keys = Object.keys(partialEntity) as Array<keyof Entity>;;
        let toSelectKeys = keys;
        let oldEntity: Entity = await manager.getRepository(target).findOne({
            select: toSelectKeys, where: {
                id_
            } as any
        });
        if (!oldEntity) {
            oldEntity = {} as Entity;
        }
        oldEntity = pickProp(oldEntity, keys) as Entity; // 防止默认值导致额外字段
        keys.forEach(key => {
            if (oldEntity[key] === undefined) {
                oldEntity[key] = null;
            }

        });
        change.oldValue = JSON.stringify(oldEntity); // 老的字段key-value
        change.newValue = JSON.stringify(partialEntity); // 新的字段key-value
        await manager.update(target, id_, partialEntity);
        return change;
    }
}