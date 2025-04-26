import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BaseProjectDto, UndoDto } from 'src/types/shape.dto';
import { StepService } from './stepService';
import { ResData } from 'src/utils/http/ResData';
import { StepEntity } from 'src/entities/step.entity';
import { Repository } from 'typeorm';
import { getUid } from 'src/utils/common';
import { WsService } from '../socket/WsService';
import { WsMessageType } from 'src/types/common';
import { StepType } from '@hfdraw/types';
import { transaction } from 'src/utils/transaction';

@Controller('step')
export class StepController {
  constructor(
  ) {}
  @Post('undo')
  async undo(@Body() dto: UndoDto) {
    // const curStep = await this.projectManager.getRepository(CurrentStep).findOne({ where: { projectId: this.projectId }, relations: ['step'] });
    // const changes = await this.stepService.undoStep(dto.projectId);
    // await this.wsService.sendToSubscribedClient(dto.projectId,{
    //   type: WsMessageType.step,
    //   data: {
    //     stepType: StepType.undo,
    //     changes,
    //     projectId: dto.projectId
    //   }
    // })
    // return new ResData(null);
  }
  @Post('redo')
  async redo(@Body() { projectId }: BaseProjectDto) {
    // const changes = await this.stepService.redoStep(projectId);
    // await this.wsService.sendToSubscribedClient(projectId,{
    //   type: WsMessageType.step,
    //   data: {
    //     stepType: StepType.redo,
    //     changes,
    //     projectId: projectId
    //   }
    // })
    // return new ResData(null);
  }
  @Get('stepStatus') 
  async stepStatus(@Query() query: BaseProjectDto) {
    transaction({
      projectId: query.projectId,
    }, async (stepManager) => {
      const res = await stepManager.stepService.stepStatus(query.projectId);
      return new ResData(res);
    });
   
  }
}
