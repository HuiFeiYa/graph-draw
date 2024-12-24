import { StepEntity } from "src/entities/step.entity"
import { UndoDto } from "src/types/shape.dto"
import { getUid } from "src/utils/common"
import { Repository } from "typeorm"
import { CurrentStepService } from "../currentStep/currentStepService"
import { InjectRepository } from "@nestjs/typeorm"
import { Change, ChangeType } from "@hfdraw/types"
import { ShapeEntity } from "src/entities/shape.entity"

export class StepService {
    constructor(
      @InjectRepository(StepEntity)
    private readonly stepRepository: Repository<StepEntity>,
    @InjectRepository(ShapeEntity)
    private readonly shapeRepository: Repository<ShapeEntity>,
    private readonly currentStepService: CurrentStepService,
    ) {

    }
    async undoStep(projectId:string) {
        const step = await this.stepRepository.findOne({
          where: {
            projectId
          }
        })
        if (step.index === 0) {
          throw new Error('目前是第一步，不能再 undo 了')
        }
        const currentStep = await this.currentStepService.findCurrentStep(projectId)
        // 按倒序重新应用 oldValue
        const changes = [...step.changes];
        changes.reverse();
        // 重新应用 changes
        for (let change of changes) {
          await this.undoChange(change);
        }
        const preIndex = step.index - 1;
        // 找出上一步 step
        const preStep = await this.stepRepository.findOne({
          where: { projectId, index: preIndex }
        });
        const preStepId = preStep?.id_;
        // 更新当前 step 指向
        await this.currentStepService.updateCurrentStep(currentStep.id_, {
          stepId: preStepId
        })
        return step.changes;
    }
    async redoStep() {
        return 'redo'
    }

    async undoChange(change:Change) {
      if (change.type === ChangeType.INSERT) {
          await this.shapeRepository.update(change.shapeId, { isDelete: true });
      } else if (change.type === ChangeType.DELETE) {
        await this.shapeRepository.update(change.shapeId, { isDelete: false });
      } else if (change.type === ChangeType.UPDATE) {
        const modelKV = change.oldValue;
        await this.shapeRepository.update(change.shapeId, JSON.parse(modelKV));
      }
    }
    async createStep(dto: { projectId: string, changes: Change[]}) {
      const step =  this.stepRepository.manager.create(StepEntity, {
        id_: getUid(),
        projectId: dto.projectId,
        index: 0,
        desc: '',
        changes: dto.changes
      })
      const savedStep = await this.stepRepository.save(step);
      return savedStep;
    }
    async initStep(dto: { projectId: string, changes: Change[] }) {
      const step = await this.createStep({projectId: dto.projectId, changes: dto.changes});
      const currentStep = await this.currentStepService.findCurrentStep(dto.projectId);
      if (currentStep) {
        await this.currentStepService.updateCurrentStep(currentStep.id_, {projectId: dto.projectId,stepId: step.id_, stepSize: currentStep.stepSize++})
      } else {
        await this.currentStepService.createCurrentStep({
          projectId: dto.projectId,
          stepId: step.id_
        })
      }
    }
}