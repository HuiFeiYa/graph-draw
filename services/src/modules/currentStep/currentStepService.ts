import { StepEntity } from "src/entities/step.entity"
import { UndoDto } from "src/types/shape.dto"
import { getUid } from "src/utils/common"
import { Repository } from "typeorm"

export class CurrentStepService {
    constructor(
    private readonly stepRepository: Repository<StepEntity>,
    ) {

    }
    async findStep() {
      return 'findStep'
    }
    async updateStep() {

    }
}