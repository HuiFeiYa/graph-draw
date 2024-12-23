import { Body, Controller, Post } from '@nestjs/common';
import { BaseProjectDto, UndoDto } from 'src/types/shape.dto';
import { StepService } from './stepService';
import { ResData } from 'src/utils/http/ResData';
import { StepEntity } from 'src/entities/step.entity';
import { Repository } from 'typeorm';
import { getUid } from 'src/utils/common';

@Controller('step')
export class StepController {
  constructor(
    private readonly stepService: StepService,
    
  ) {}
  @Post('undo')
  async undo(@Body() dto: UndoDto) {
    // const curStep = await this.projectManager.getRepository(CurrentStep).findOne({ where: { projectId: this.projectId }, relations: ['step'] });
    const res = await this.stepService.undoStep(dto);
    return new ResData(res);
  }
  @Post('redo')
  async redo(@Body() { projectId }: BaseProjectDto) {
    const res = await this.stepService.redoStep();
    return new ResData(res);
  }
}
