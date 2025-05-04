import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ShapeService } from './shape.services';
import { ResData } from 'src/utils/http/ResData';
import {
  FetchAllShapeDto,
  UpdateShapeBoundsDto,
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
import { transaction } from 'src/utils/transaction';

@Controller('shape')
export class ShapeController {
  constructor(
  ) {}
  @Post('sidebarDrop')
  async sidebarDrop(@Body() dto: SideBarDropDto) {
    return transaction({
      projectId: dto.projectId,
    },  async (stepManager) => {
      const res = await stepManager.shapeService.sideBarItemDrop(dto);
      return res.map((item) => {
        return {
          type: ChangeType.INSERT,
          newValue: JSON.stringify(item),
          projectId: dto.projectId,
          shapeId: item.id_,
        };
      });
    });
  }
  @Get('diagram/allShape')
  async getDiagramAllShape(@Query() dto: FetchAllShapeDto) {
    return transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
      const result = await stepManager.shapeService.getDiagramAllShape(dto);
    return new ResData(result);
    });
  }
  @Post('move')
  async moveShape(@Body() dto: MoveShapeDto) {
    transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
      return await stepManager.shapeService.moveShape(dto);
    });
  }
//   @Post('connectShapeAndCreate')
//   async connectShapeAndCreate(
//     @Body() connectShapeAndCreateDto: ConnectShapeAndCreateDto,
//   ) {
//     const handle = transaction({
//       shapeService: this.shapeService,
//       wsService: this.wsService,
//       stepService: this.stepService
//     }, connectShapeAndCreateDto, async (stepManager) => {
//       const res = await stepManager.shapeService.connectShapeAndCreate(connectShapeAndCreateDto);
//       return res.map((item) => {
//         return {
//           type: ChangeType.INSERT,
//           newValue: JSON.stringify(item),
//           projectId: connectShapeAndCreateDto.projectId,
//           shapeId: item.id_,
//         };
//       });
//     });
//     return handle();
//   }
//   @Post('moveEdge') 
//   async moveEdge(@Body() dto: MoveEdgeDto) {
//     const handle = transaction({
//       shapeService: this.shapeService,
//       wsService: this.wsService,
//       stepService: this.stepService
//     }, dto, async (stepManager) => {
//       return await stepManager.shapeService.moveEdge(dto);
//     });
//     return handle();
//   }
//   @Post('updateShapeStyle')
//   async updateShapeStyle(@Body() dto:UpdateStyleObj) {
//     const handle = transaction({
//       shapeService: this.shapeService,
//       wsService: this.wsService,
//       stepService: this.stepService
//     }, dto, async (stepManager) => {
//       return await stepManager.shapeService.updateShapeStyle(dto);
//     });
//     return handle();
//   }
 
 
//   @Post('clear')
//   async clearProject(@Body() dto: BaseProjectDto) {
//     const handle = transaction({
//       shapeService: this.shapeService,
//       wsService: this.wsService,
//       stepService: this.stepService
//     }, dto, async (stepManager) => {
//       return await stepManager.shapeService.clearShapes(dto);
//     });
//     return handle();
//   }
//   @Post('createMindMapRect')
//   async createMindMapRect(@Body() dto:CreateMindMapRectDto) {
//     const handle = transaction({
//       shapeService: this.shapeService,
//       wsService: this.wsService,
//       stepService: this.stepService
//     }, dto, async (stepManager) => {
//       const changes = await stepManager.shapeService.createMindMapRect(dto);
//       return changes;
//     })
//     return handle();
//   }
//   @Post('saveText')
//   async saveText(@Body() dto:SaveTextDto) {
//     const handle = transaction({
//       shapeService: this.shapeService,
//       wsService: this.wsService,
//       stepService: this.stepService
//     }, dto, async (stepManager) => {
//       const changes = await stepManager.shapeService.saveText(dto);
//       return changes;
//     });
//     return handle();
//   }
//   @Post('expandShape')
//   async expandShape(@Body() dto:ExpandShapeDto) {
//     const handle = transaction({
//       shapeService: this.shapeService,
//       wsService: this.wsService,
//       stepService: this.stepService
//     }, dto, async (stepManager) => {
//       const changes = await stepManager.shapeService.expandShape(dto);
//       return changes;
//     });
//     return handle();
//   }
//   @Post('updateShapeBounds')
//   async updateShapeBounds(@Body() dto: UpdateShapeBoundsDto) {
//     const handle = transaction({
//       shapeService: this.shapeService,
//       wsService: this.wsService,
//       stepService: this.stepService
//     }, dto, async (stepManager) => {
//       return await stepManager.shapeService.updateShapeBounds(dto);
//     });
//     return handle();
//   }

//   @Get('test')
//   async test() {
//     return this.shapeService.test();
//   }
  
// }
// interface ControllerInstance { shapeService: ShapeService; wsService: WsService; stepService: StepService };
// function transaction<T>(
//   controllerInstance: ControllerInstance, 
//   projectParams: { projectId: string }, 
//   callback: (stepManager: ControllerInstance) => Promise<Change[]>
// ): () => Promise<ResData<T>> {
//   return async () => {
//     const stepManager = {
//       shapeService: controllerInstance.shapeService,
//       wsService: controllerInstance.wsService,
//       stepService: controllerInstance.stepService
//     };
//     const changes = await callback(stepManager);
//     await stepManager.stepService.initStep({ projectId: projectParams.projectId, changes });
//     await stepManager.wsService.sendToSubscribedClient(projectParams.projectId, {
//       type: WsMessageType.step,
//       data: {
//         projectId: projectParams.projectId,
//         changes,
//         stepType: StepType.edit
//       }
//     });
//     return new ResData(null);
//   };
}