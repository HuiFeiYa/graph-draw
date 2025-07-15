import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ResData } from 'src/utils/http/ResData';
import { In } from 'typeorm';
import {
  FetchAllShapeDto,
  UpdateShapeBoundsDto,
  MoveShapeDto,
  SideBarDropDto,
  ConnectShapeAndCreateDto,
  MoveEdgeDto,
  MoveSegmentDto,
  UpdateStyleObj,
  CreateMindMapRectDto,
  SaveTextDto,
  ExpandShapeDto,
  BaseProjectDto,
  ShapeResizeDto,
  GetMinimumBoundsDto,
  ChangeRelationshipEndsDto,
} from 'src/types/shape.dto';
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
      return new ResData(res);
    });
  }
  @Get('diagram/allShape')
  async getDiagramAllShape(@Query() dto: FetchAllShapeDto) {
    return transaction({
      projectId: dto.projectId,
      lockProject: false,
      initStep:false
    }, async (stepManager) => {
      const result = await stepManager.shapeService.getDiagramAllShape(dto);
    return new ResData(result);
    });
  }
  @Post('move')
  async moveShape(@Body() dto: MoveShapeDto) {
    return transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
       const result = await stepManager.shapeService.moveShape(dto);
       return new ResData(result);
    });
  }

  @Post("resize")
  async resizeShape(@Body() resizeDto: ShapeResizeDto) {
    return transaction({ projectId: resizeDto.projectId }, async stepManager => {
      const data = await stepManager.shapeService.resizeShape(resizeDto);
      return new ResData(data);
    });

  }

  @Post('minimumBounds')
  async minimumBounds(@Body() minimumBounds: GetMinimumBoundsDto) {
    return transaction({ projectId: minimumBounds.projectId, lockProject: false, initStep: false }, async stepManager => {
      const data = await stepManager.shapeService.getMinBounds(minimumBounds);
      return new ResData(data);
    });
  }
  @Post('connectShapeAndCreate')
  async connectShapeAndCreate(
    @Body() connectShapeAndCreateDto: ConnectShapeAndCreateDto,
  ) {
    return transaction({
      projectId: connectShapeAndCreateDto.projectId,
    }, async (stepManager) => {
      const res = await stepManager.shapeService.connectShapeAndCreate(connectShapeAndCreateDto);
      return new ResData(res);
    });
  }
  @Post('moveEdge') 
  async moveEdge(@Body() dto: MoveEdgeDto) {
    return transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
      const result = await stepManager.shapeService.moveEdge(dto);
      return new ResData(result);
    });
  }
  @Post('moveSegment')
  async moveSegment(@Body() dto: MoveSegmentDto) {
    return transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
      const result = await stepManager.shapeService.moveSegment(dto);
      return new ResData(result);
    });
  }
  @Post('updateShapeStyle')
  async updateShapeStyle(@Body() dto:UpdateStyleObj) {
    return transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
      const result = await stepManager.shapeService.updateShapeStyle(dto);
      return new ResData(result);
    });
  }
 
 
  @Post('clear')
  async clearProject(@Body() dto: BaseProjectDto) {
    return transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
      const result = await stepManager.shapeService.clearShapes(dto);
      return new ResData(result);
    });
  }
  @Post('createMindMapRect')
  async createMindMapRect(@Body() dto:CreateMindMapRectDto) {
    return transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
      const result = await stepManager.shapeService.createMindMapRect(dto);
      return new ResData(result);
    });
  }
  @Post('saveText')
  async saveText(@Body() dto:SaveTextDto) {
    return transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
      const result = await stepManager.shapeService.saveText(dto);
      return new ResData(result);
    });
  }
  @Post('expandShape')
  async expandShape(@Body() dto:ExpandShapeDto) {
    return transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
      const result = await stepManager.shapeService.expandShape(dto);
      return new ResData(result);
    });
  }
  @Post('updateShapeBounds')
  async updateShapeBounds(@Body() dto: UpdateShapeBoundsDto) {
    return transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
      const result = await stepManager.shapeService.updateShapeBounds(dto);
      return new ResData(result);
    });
  }
  @Post('changeRelationshipEnds')
  async changeRelationshipEnds(@Body() dto: ChangeRelationshipEndsDto) {
    return transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
      const result = await stepManager.shapeService.changeRelationshipEnds(dto);
      return new ResData(result);
    });
  }
  @Post('batchUpdateShapeStyle')
  async batchUpdateShapeStyle(@Body() dto: { projectId: string; shapeIds: string[]; styleObject: any }) {
    return transaction({ projectId: dto.projectId }, async (stepManager) => {
      const result = await stepManager.shapeService.batchUpdateShapeStyle(dto.projectId, dto.shapeIds, dto.styleObject);
      return new ResData(result);
    });
  }
  
}