import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ShapeService } from "./shape.services";
import { ResData } from "src/utils/http/ResData";
import { FetchAllShapeDto, MoveShapeDto, SideBarDropDto } from "src/types/shape.dto";
import { WsService } from "../socket/WsService";
import { WsMessageType } from "src/types/common";
import { ChangeType } from "@hfdraw/types";

@Controller('shape')
export class ShapeController {
    constructor(
        private readonly shapeService: ShapeService,
        private readonly wsService: WsService, // 注入 WsService
        ) {}
    @Post('sidebarDrop')
    async sidebarDrop(@Body() dto: SideBarDropDto) {
        const res = await this.shapeService.sideBarItemDrop(dto)
        await this.wsService.sendToSubscribedClient(dto.projectId, {
            type: WsMessageType.step,
            data: {
              projectId: dto.projectId,
              changes: res.map((item) => {
                return {
                  type: ChangeType.INSERT,
                  newValue: JSON.stringify(item),
                  projectId: dto.projectId,
                };
              }),
            },
          });
    }
    @Get('diagram/allShape') 
    async getDiagramAllShape(@Query() dto: FetchAllShapeDto) {
        const result = await this.shapeService.getDiagramAllShape(dto);
        return new ResData(result)
    }
    @Post("move")
    async moveShape(@Body() moveShapeDto: MoveShapeDto) {
        const data = await this.shapeService.moveShape(moveShapeDto);
        return new ResData(data);
    }
    @Get('test')
    async test() {
      return this.shapeService.test();
    }
}