// @ts-nocheck
import { StepEntity } from "src/entities/step.entity"
import { UndoDto } from "src/types/shape.dto"
import { getUid } from "src/utils/common"
import {  LessThanOrEqual, MoreThan, Repository } from "typeorm"
import { CurrentStepService } from "../currentStep/currentStepService"
import { InjectRepository } from "@nestjs/typeorm"
import { Change, ChangeType } from "@hfdraw/types"
import { ShapeEntity } from "src/entities/shape.entity"
import { StepManager } from "src/utils/StepManager"

export class StepService {
    constructor(
      public stepManager: StepManager
    ) {

    }
    async undoStep(projectId:string) {
      // 这里要找 currentStep 对应的 stepId
      const currentStep = await this.stepManager.currentStepService.findCurrentStep(projectId)

        const steps = await this.stepManager.stepRep.find({
          where: {
            projectId,
            index: LessThanOrEqual(currentStep.index)
          },
          order: {
            index: 'desc'
          },
          take: 2
        })
        if (steps.length === 0) {
          throw new Error('不存在 step 记录，不能 undo')
        }
        // 当前的 step 记录
        const step = steps[0];
        const preStep = steps[1];
        if (step.index < 0) {
          throw new Error('不能再 undo 了')
        }
        // 按倒序重新应用 oldValue
        const changes = [...step.changes];
        changes.reverse();
        // 重新应用 changes
        for (let change of changes) {
          await this.undoChange(change);
        }
        // 更新当前 CurrentStep 指向
        const preStepId = preStep ? preStep.id_ : null;
        const preIndex = preStep ? preStep.index : null;
        await this.stepManager.currentStepService.updateCurrentStep(currentStep.id_, {
          stepId: preStepId,
          index: preIndex
        })
        
        
        return step.changes;
    }




    async redoStep(projectId: string) {
      const currentStep = await this.stepManager.currentStepService.findCurrentStep(projectId);
      // 不存在 currentstep时，例如回退到最开始的时候，

      const steps = await this.stepManager.stepRep.find({
        where: {
          projectId,
          index: MoreThan(currentStep.stepId? currentStep.index : -1)
        },
        order: {
          

          index: 'asc'
        },
        take: 1
      })

      // 找到redo下一个step, 应用下一个 step 的 newValue
      const nextStep = steps[0];
      if (!nextStep) {
        throw new Error('不存在下一个 step')
      }
      for(let change of nextStep.changes) {
        await this.redoChange(change);
      }
      await this.stepManager.currentStepService.updateCurrentStep(currentStep.id_, {
        stepId: nextStep.id_,
        index: nextStep.index
      })
      
      return nextStep.changes;
    }

    async undoChange(change:Change) {
      if (!change.elementId) {
        console.warn('Change elementId is empty, skipping update:', change);
        return;
      }
      // 使用 typeorm 的 update 更新数据库数据用法
      if (change.type === ChangeType.INSERT) {
          await this.stepManager.shapeRep.update({id:change.elementId}, { isDelete: true });
      } else if (change.type === ChangeType.DELETE) {
        await this.stepManager.shapeRep.update({id: change.elementId}, { isDelete: false });
      } else if (change.type === ChangeType.UPDATE) {
        const modelKV = change.oldValue;
        await this.stepManager.shapeRep.update({id: change.elementId}, modelKV);
      }
    }

    async redoChange(change:Change) {
      if (!change.elementId) {
        console.warn('Change elementId is empty, skipping update:', change);
        return;
      }
      
      if (change.type === ChangeType.INSERT) {
        await this.stepManager.shapeRep.update(change.elementId, { isDelete: false });
  
      } else if (change.type === ChangeType.DELETE) {
        await this.stepManager.shapeRep.update(change.elementId, { isDelete: true });
  
      } else if (change.type === ChangeType.UPDATE) {
        const modelKV = change.newValue;
        await this.stepManager.shapeRep.update(change.elementId, modelKV);
  
      }
    }
    // 创建一个新的 step
    async createStep(dto: { projectId: string, changes: Change[]}) {
      const currentStep = await this.stepManager.currentStepService.findCurrentStep(dto.projectId);
      let preStep = null;
      if (currentStep) {
        preStep = await this.stepManager.stepRep.findOne({where: { id_: currentStep.stepId}});
        await this.stepManager.stepRep.createQueryBuilder()
              .delete()
              .from(StepEntity)
              .where('projectId =:projectId AND index > :index', {
                projectId: dto.projectId,
                index: preStep.index
              })
              .execute();
      }

      // todo 需要根据当前 currentStep 指针位置判断是否需要删除，还是新增
      // 如果回退两步，然后再更新一步，需要将指针后面的 step 都删除掉然后重新新增 step
      const step =  this.stepManager.stepRep.manager.create(StepEntity, {
        id_: getUid(),
        projectId: dto.projectId,
        index: preStep? preStep.index + 1 :  0,
        desc: '',
        changes: dto.changes
      })
      const savedStep = await this.stepManager.stepRep.save(step);
      return savedStep;
    }
    // 生成一个 step，并且更新 currentStep
    async initStep(dto: { projectId: string, changes: Change[] }) {
      const step = await this.createStep({projectId: dto.projectId, changes: dto.changes});
      const currentStep = await this.stepManager.currentStepService.findCurrentStep(dto.projectId);
      // todo 查找 step 个数，更新到 stepSize 中
      const stepSize = await this.stepManager.stepRep.count();
      if (currentStep) {
        await this.stepManager.currentStepService.updateCurrentStep(currentStep.id_, {projectId: dto.projectId,stepId: step.id_, stepSize: stepSize, index: step.index})
      } else {
        await this.stepManager.currentStepService.createCurrentStep({
          projectId: dto.projectId,
          stepId: step.id_,
          index: step.index,
          stepSize: stepSize
        })
      }
    }
    // 获取是否可以 redo， undo 状态
    async stepStatus(projectId: string) {
      const result = {
        currentStepId: '', // 项目当前所处的stepId，
        hasPreStep: false, // 是否有前面的步骤（可以undo）
        hasNextStep: false //  是否有后面的步骤（可以redo）
      };
      const currentStep = await this.stepManager.currentStepService.findCurrentStep(projectId);
      if (!currentStep) {
        return result
      }
      result.currentStepId = currentStep.stepId || '';
      let step: StepEntity; // 此step是当前已执行的step
  
      if (currentStep.stepId) {
        result.hasPreStep = true;
        step = await this.stepManager.stepRep.findOne({ where: {id_: currentStep.stepId }});
      }
  
      if (step) {
        if (step.index < currentStep.stepSize - 1) {
          result.hasNextStep = true;
        }
      } else {
        if (currentStep.stepSize > 0) {
          result.hasNextStep = true;
        }
      }
      return result;
    }
}