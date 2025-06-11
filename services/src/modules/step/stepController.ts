import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BaseProjectDto, UndoDto } from 'src/types/shape.dto';
import { StepService } from './stepService';
import { ResData } from 'src/utils/http/ResData';
import { StepEntity } from 'src/entities/step.entity';
import { Repository } from 'typeorm';
import { getUid } from 'src/utils/common';
import { wsService, WsService } from '../socket/WsService';
import { WsMessageType } from 'src/types/common';
import { Change, StepType } from '@hfdraw/types';
import { transaction } from 'src/utils/transaction';

@Controller('step')
export class StepController {
  constructor(
  ) {}
  @Post('undo')
  async undo(@Body() dto: UndoDto) {
    let changes: Change[] = []
    await transaction({
      projectId: dto.projectId,
      lockProject: true,
      initStep: false,
    }, async (stepManager) => {
      changes = await stepManager.stepService.undoStep(dto.projectId);
    });
    wsService.sendToSubscribedClient(dto.projectId, {
      type: WsMessageType.step,
      data: {
          projectId: dto.projectId,
          changes,
          stepType: StepType.undo
      }
    });
    return new ResData(null);
  };
  @Post('redo')
  async redo(@Body() dto: BaseProjectDto) {
    const projectId = dto.projectId;
    let changes: Change[] = []
    await transaction({
      projectId: projectId,
      lockProject: true,
      initStep: false,
    }, async (stepManager) => {
      changes = await stepManager.stepService.redoStep(projectId);
    });
    wsService.sendToSubscribedClient(dto.projectId, {
      type: WsMessageType.step,
      data: {
          projectId: dto.projectId,
          changes,
          stepType: StepType.redo
      }
    });
    return new ResData(null);

  }
  @Get('stepStatus') 
  async stepStatus(@Query() query: BaseProjectDto) {
    return transaction({
      projectId: query.projectId,
      lockProject: false,
      initStep: false,
    }, async (stepManager) => {
      const res = await stepManager.stepService.stepStatus(query.projectId);
      return new ResData(res);
    });
   
  }
}
