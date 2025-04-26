import { Step } from "@hfdraw/types"
import { InjectRepository } from "@nestjs/typeorm"
import { CurrentStep } from "src/entities/currentStep.entity"
import { UndoDto } from "src/types/shape.dto"
import { CreateStepDto, UpdateStepDto } from "src/types/step.dto"
import { getUid } from "src/utils/common"
import { StepManager } from "src/utils/StepManager"
import { Repository } from "typeorm"
export class CurrentStepService {
    constructor(
      public stepManager: StepManager
    ) {

    }
    async findCurrentStep(projectId: string) {
      return this.stepManager.currentStepRep.findOne({
        where: {
          projectId
        }
      })
    }
    async updateCurrentStep(id_:number, params: UpdateStepDto) {
      return this.stepManager.currentStepRep.update(id_, params)
    }
    async createCurrentStep(params: CreateStepDto) {
      return this.stepManager.currentStepRep.save({
          stepSize: params.stepSize,
          projectId: params.projectId,
          stepId: params.stepId,
          index: params.index || 0
      })
    }
}