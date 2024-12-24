import { StepEntity } from "src/entities/step.entity"
import { UndoDto } from "src/types/shape.dto"
import { getUid } from "src/utils/common"
import { Repository } from "typeorm"
import { CurrentStepService } from "../currentStep/currentStepService"
import { InjectRepository } from "@nestjs/typeorm"
import { Change } from "@hfdraw/types"

export class StepService {
    constructor(
      @InjectRepository(StepEntity)
    private readonly stepRepository: Repository<StepEntity>,
    private readonly currentStepService: CurrentStepService
    ) {

    }
    async undoStep({ projectId, index, desc }: UndoDto) {
        
        /**
         *     if (curStep.step === null) {
      this.step.index = 0;
    } else {
      this.step.index = curStep.step.index + 1;
    }
         */
        return 'undo'
    }
    async redoStep() {
        return 'redo'
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