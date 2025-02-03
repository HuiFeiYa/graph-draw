import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ShapeService } from './shape.services';
import { ResData } from 'src/utils/http/ResData';
import {
  FetchAllShapeDto,
  MoveShapeDto,
  SideBarDropDto,
  ConnectShapeAndCreateDto,
  MoveEdgeDto,
  UpdateStyleObj,
} from 'src/types/shape.dto';
import { WsService } from '../socket/WsService';
import { WsMessageType } from 'src/types/common';
import { ChangeType, StepType } from '@hfdraw/types';
import { StepService } from '../step/stepService';

@Controller('shape')
export class ShapeController {
  constructor(
    private readonly shapeService: ShapeService,
    private readonly wsService: WsService, // 注入 WsService
    private readonly stepService: StepService,
  ) {}
  @Post('sidebarDrop')
  async sidebarDrop(@Body() dto: SideBarDropDto) {
    const res = await this.shapeService.sideBarItemDrop(dto);
    await this.wsService.sendToSubscribedClient(dto.projectId, {
      type: WsMessageType.step,
      data: {
        projectId: dto.projectId,
        changes: res.map((item) => {
          return {
            type: ChangeType.INSERT,
            newValue: JSON.stringify(item),
            projectId: dto.projectId,
            shapeId: item.id_,
          };
        }),
        stepType: StepType.edit,
      },
    });
  }
  @Get('diagram/allShape')
  async getDiagramAllShape(@Query() dto: FetchAllShapeDto) {
    const result = await this.shapeService.getDiagramAllShape(dto);
    return new ResData(result);
  }
  @Post('move')
  async moveShape(@Body() dto: MoveShapeDto) {
    const changes = await this.shapeService.moveShape(dto);
    await this.stepService.initStep({ projectId: dto.projectId, changes });
    await this.wsService.sendToSubscribedClient(dto.projectId, {
      type: WsMessageType.step,
      data: {
        projectId: dto.projectId,
        changes,
        stepType: StepType.edit,
      },
    });
    return new ResData(null);
  }

  @Post('connectShapeAndCreate')
  async connectShapeAndCreate(
    @Body() connectShapeAndCreateDto: ConnectShapeAndCreateDto,
  ) {
    const res = await this.shapeService.connectShapeAndCreate(
      connectShapeAndCreateDto,
    );
    const changes = res.map((item) => {
      return {
        type: ChangeType.INSERT,
        newValue: JSON.stringify(item),
        projectId: connectShapeAndCreateDto.projectId,
        shapeId: item.id_,
      };
    });
    await this.wsService.sendToSubscribedClient(
      connectShapeAndCreateDto.projectId,
      {
        type: WsMessageType.step,
        data: {
          projectId: connectShapeAndCreateDto.projectId,
          changes,
          stepType: StepType.edit,
        },
      },
    );
    await this.stepService.initStep({
      projectId: connectShapeAndCreateDto.projectId,
      changes,
    });
    return new ResData(null);
  }
  @Post('moveEdge') 
  async moveEdge(@Body() dto: MoveEdgeDto) {
    const changes = await this.shapeService.moveEdge(dto);
    await this.stepService.initStep({
      projectId: dto.projectId,
      changes,
    });
    await this.wsService.sendToSubscribedClient(dto.projectId, {
      type: WsMessageType.step,
      data: {
        projectId: dto.projectId,
        changes,
        stepType: StepType.edit
      }
    })
    return new ResData(null);
  }

  @Post('updateShapeStyle')
  async updateShapeStyle(@Body() dto:UpdateStyleObj) {
    const changes = await this.shapeService.updateShapeStyle(dto);
    await this.stepService.initStep({
      projectId: dto.projectId,
      changes,
    });
    await this.wsService.sendToSubscribedClient(dto.projectId, {
      type: WsMessageType.step,
      data: {
        projectId: dto.projectId,
        changes,
        stepType: StepType.edit
      }
    })
    return new ResData(null);
  }
  @Get('test')
  async test() {
    return this.shapeService.test();
  }
}
