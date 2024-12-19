import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ShapeService } from "./shape.services";
import { ResData } from "src/utils/http/ResData";
import { FetchAllShapeDto, MoveShapeDto, SideBarDropDto } from "src/types/shape.dto";

@Controller('shape')
export class ShapeController {
    constructor(private readonly shapeService: ShapeService) {}
    @Post('sidebarDrop')
    async sidebarDrop(@Body() dto: SideBarDropDto) {
        const result = await this.shapeService.sideBarItemDrop(dto)
        return new ResData(result);
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
}