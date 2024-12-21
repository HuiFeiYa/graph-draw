import { Body, Controller, Post } from '@nestjs/common';
import { BaseProjectDto } from 'src/types/shape.dto';
import { StepService } from './stepService';
import { ResData } from 'src/utils/http/ResData';

@Controller('step')
export class StepController {
  constructor(private readonly stepService: StepService) {}
  @Post('undo')
  async undo(@Body() { projectId }: BaseProjectDto) {
    const res = await this.stepService.undoStep();
    return new ResData(res);
  }
  @Post('redo')
  async redo(@Body() { projectId }: BaseProjectDto) {
    const res = await this.stepService.redoStep();
    return new ResData(res);
  }
}
