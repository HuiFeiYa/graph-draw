import { Change, ChangeType } from "@hfdraw/types";
import { ShapeEntity } from "src/entities/shape.entity";
import { breakArray, pickProp } from "src/utils/common";
import { StepManager } from "src/utils/StepManager";
import { DeepPartial, EntityManager, EntityTarget, In, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class BaseService {
    constructor(public stepManager: StepManager) {
    }


    get projectManager() {
        return this.stepManager.projectManager;

    }

    private getTableName<Entity>(targetOrEntity: EntityTarget<Entity>) {
        return this.stepManager.projectManager.connection.getMetadata(targetOrEntity).tableName;
    }
    private getInsertChanges<Entity>(entices: { id_: number, id:string }[], tableName: string) {
        const changes = entices.map(entity => {
          const change = new Change();
          change.type = ChangeType.INSERT;
          change.table = tableName;
    
          change.objectId = (entity as any).id_;
          change.elementId = entity.id;
          return change;
        });
        return changes;
      }

/**
  ------------ 记录step的变更方法  -----------------------
   */
  /**
   * 记录step的变更方法,插入元素
   * @param targetOrEntity
   * @param entity
   * @returns
   */
  async addEntity<Entity, T extends DeepPartial<Entity>>(targetOrEntity: EntityTarget<Entity>, entity: T): Promise<T & Entity> {

    const change = new Change();
    change.type = ChangeType.INSERT;
    change.table = this.getTableName(targetOrEntity);
    const entity2 = await this.projectManager.save(targetOrEntity, entity);
    if (this.stepManager.step) {
      change.objectId = (entity2 as any).id_;
      change.elementId = (entity2 as any).id;
      this.stepManager.step.changes.push(change);
    }
    return entity2;
  }

  async addEntities<Entity, T extends DeepPartial<Entity>>(targetOrEntity: EntityTarget<Entity>, entices: T[]): Promise<T[] & Entity[]> {
    if (this.stepManager.step) {
      const entices2 = await this.projectManager.save(targetOrEntity, entices, { chunk: 300 });
      const tableName = this.getTableName(targetOrEntity);
      const changes = this.getInsertChanges(entices2 as any, tableName);
      this.stepManager.step.changes = this.stepManager.step.changes.concat(changes);
      return entices2;
    } else {
      const entices2 = await this.projectManager.save(targetOrEntity, entices, { chunk: 300 });
      return entices2;
    }
  }


    async updateEntity<Entity>(target: EntityTarget<Entity>, id_: number, partialEntity: QueryDeepPartialEntity<Entity>) {
        if (this.stepManager.step) {
            const rep = this.projectManager.getRepository(target);

            const element = await (rep as any).findOne({ select: ['id_', 'id'], where: { id_: id_ } });

            const change = new Change();
            change.type = ChangeType.UPDATE;
            const tableName = this.getTableName(target);

            change.table = tableName;

            change.objectId = id_;
            change.elementId = element.id;
            const keys = Object.keys(partialEntity);
            let toSelectKeys = keys;
            // let hasDiagramId = false;
            let diagramId: string | undefined;

            let oldEntity = await this.projectManager.getRepository(target).findOne({ where: { id_ } as any, select: toSelectKeys as any }) as Partial<Entity>;
            if (!oldEntity) {
                oldEntity = {} as Partial<Entity>; // hack 如果一个属性都查不到会返回null，所以这里处理
            }
            diagramId = (oldEntity as any).diagramId;
            //
            oldEntity = pickProp(oldEntity, keys as any); // 防止默认值导致额外字段
            keys.forEach(key => {
                if (oldEntity[key] === undefined) {
                    oldEntity[key] = null;
                }
            });

            change.oldValue = oldEntity; // 老的字段key-value
            change.newValue = partialEntity; // 新的字段key-value
            this.stepManager.step.changes.push(change);
        }
        const result = await this.projectManager.update(target, id_, partialEntity);

        return result;

    }
    
    /**
   * 记录step的变更方法 ，更新属性
   * 批量更新
   * @param target 实体的class
   * @param ids_ 行ids,不得重复
   * @param partialEntitys 更新的字段 {key:'val',key2:val2}[]
   * @returns
   */
  async updateEntities<Entity>(target: EntityTarget<Entity>, ids_: number[], partialEntitys: QueryDeepPartialEntity<Entity>[]) {
    // const start = Date.now();
    const updatePromises: Promise<UpdateResult>[] = [];
    const rep = this.projectManager.getRepository(target); // as Repository<Shape> | Repository<Model>;

    const idss = breakArray(ids_, 10000);
    let elements:ShapeEntity[] = [];
    for (let ids of idss) {
      const elementSlice = await (rep as any).find({ select: ['id_', 'id'], where: { id_: In(ids) } });
      elements = elements.concat(elementSlice);

    }

    const idMap = new Map<number, string>();
    elements.forEach(ele => {
      idMap.set(ele.id_, ele.id);
    });
    if (this.stepManager.step) {
      // const results = [];
      const keySet = new Set<string>();

      for (let partialEntity of partialEntitys) {
        Object.keys(partialEntity).forEach(key => keySet.add(key));
      }

      const map = new Map<number, Partial<Entity>>();
      // 一次性查询所有
      let eintitys: Entity[] = [];
      const idss_ = breakArray(ids_, 10000);
      for (let idSlice of idss_) {
        const eintitys2 = await this.projectManager.getRepository(target).find({ select: [...keySet, "id_"] as any, where: { id_: In(idSlice) } as any });
        eintitys = eintitys.concat(eintitys2);
      }

      eintitys.forEach((ent: any) => {
        map.set(ent.id_ as number, ent);
      });

      const tableName = this.getTableName(target);

      for (let i = 0; i < ids_.length; i++) {
        const id_ = ids_[i];
        const partialEntity = partialEntitys[i];
        if (Object.keys(partialEntity).length === 0) continue;
        const change = new Change();
        change.type = ChangeType.UPDATE;
        change.table = tableName;

        change.objectId = id_;
        change.elementId = idMap.get(id_);
        const keys = Object.keys(partialEntity);
        if (keys.length === 0) continue;// 没有传任何变化，不处理
        let oldEntity = map.get(id_);

        oldEntity = pickProp<any>(oldEntity, keys); // 防止默认值导致额外字段
        change.oldValue = oldEntity; // 老的字段key-value
        change.newValue = partialEntity; // 新的字段key-value

        this.stepManager.step.changes.push(change);
        updatePromises.push(this.projectManager.createQueryBuilder().update(target).set(partialEntity).where({ id_: id_ }).execute());

      }

    } else {
      for (let i = 0; i < ids_.length; i++) {
        const id_ = ids_[i];
        const partialEntity = partialEntitys[i];
        if (Object.keys(partialEntity).length === 0) continue;

        updatePromises.push(this.projectManager.createQueryBuilder().update(target).set(partialEntity).where({ id_: id_ }).execute());

      }

    }
    let results = await Promise.all(updatePromises);
    return results;

  }
}