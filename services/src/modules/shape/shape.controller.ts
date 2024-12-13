import { Body, Controller, Post } from "@nestjs/common";
import { ShapeService } from "./shape.services";
import { ResData } from "src/utils/http/ResData";
import { SideBarDropDto } from "src/types/shape.dto";

@Controller('shape')
export class ShapeController {
    constructor(private readonly shapeService: ShapeService) {}
    @Post('sidebarDrop')
    async sidebarDrop(@Body() dto: SideBarDropDto) {
        const result = await this.shapeService.sideBarItemDrop(dto)
        return new ResData(result);
    }
}