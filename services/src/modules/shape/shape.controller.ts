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
  CreateMindMapRectDto,
  SaveTextDto,
  ExpandShapeDto,
  BaseProjectDto,
} from 'src/types/shape.dto';
import { WsService } from '../socket/WsService';
import { WsMessageType } from 'src/types/common';
import { Change, ChangeType, StepType } from '@hfdraw/types';
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
  @Post('createMindMapRect')
  async createMindMapRect(@Body() dto:CreateMindMapRectDto) {
    const handle = transaction({
      shapeService: this.shapeService,
      wsService: this.wsService,
      stepService: this.stepService
    }, dto, async (stepManager) => {
      const changes = await stepManager.shapeService.createMindMapRect(dto);
      return changes;
    })
    return handle(); // 调用 transaction 函数并返回其返回值，即 ResData 实例，包含处理结果和错误信息
  }
  @Post('saveText')
  async saveText(@Body() dto:SaveTextDto) {
    const changes = await this.shapeService.saveText(dto);
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
  @Post('expandShape')
  async expandShape(@Body() dto:ExpandShapeDto) {
    const changes = await this.shapeService.expandShape(dto);
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
  @Post('clear')
  async clearProject(@Body() dto: BaseProjectDto) {
    const changes = await this.shapeService.clearShapes(dto);
    await this.wsService.sendToSubscribedClient(dto.projectId, {
      type: WsMessageType.step,
      data: {
        projectId: dto.projectId,
        changes,
        stepType: StepType.edit
      }
    });
    return new ResData();
  }
}
interface ControllerInstance { shapeService: ShapeService; wsService: WsService; stepService: StepService };
function transaction<T>(
  controllerInstance: ControllerInstance, 
  projectParams: { projectId: string }, 
  callback: (stepManager: ControllerInstance) => Promise<Change[]>
): () => Promise<ResData<T>> {
  return async () => {
    const stepManager = {
      shapeService: controllerInstance.shapeService,
      wsService: controllerInstance.wsService,
      stepService: controllerInstance.stepService
    };
    const changes = await callback(stepManager);
    await stepManager.stepService.initStep({ projectId: projectParams.projectId, changes });
    await stepManager.wsService.sendToSubscribedClient(projectParams.projectId, {
      type: WsMessageType.step,
      data: {
        projectId: projectParams.projectId,
        changes,
        stepType: StepType.edit
      }
    });
    return new ResData(null);
  };
}