import { InjectRepository } from "@nestjs/typeorm"
import { CurrentStep } from "src/entities/currentStep.entity"
import { UndoDto } from "src/types/shape.dto"
import { CreateStepDto, UpdateStepDto } from "src/types/step.dto"
import { getUid } from "src/utils/common"
import { Repository } from "typeorm"
export class CurrentStepService {
    constructor(
      @InjectRepository(CurrentStep) 
    private readonly stepRepository: Repository<CurrentStep>,
    ) {

    }
    async findCurrentStep(projectId: string) {
      return this.stepRepository.findOne({
        where: {
          projectId
        }
      })
    }
    async updateCurrentStep(id_:number, params: UpdateStepDto) {
      return this.stepRepository.update(id_, params)
    }
    async createCurrentStep(params: CreateStepDto) {
      return this.stepRepository.save({
          stepSize: 1,
          projectId: params.projectId,
          stepId: params.stepId
      })
    }
}