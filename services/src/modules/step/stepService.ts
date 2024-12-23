import { StepEntity } from "src/entities/step.entity"
import { UndoDto } from "src/types/shape.dto"
import { getUid } from "src/utils/common"
import { Repository } from "typeorm"

export class StepService {
    constructor(
    private readonly stepRepository: Repository<StepEntity>
    ) {

    }
    async undoStep({ projectId, index, desc }: UndoDto) {
        const step = await this.stepRepository.manager.create(StepEntity, {
            id_: getUid(),
            projectId: projectId,
            index: 0,
            desc: '',
            changes: []
          })
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
}