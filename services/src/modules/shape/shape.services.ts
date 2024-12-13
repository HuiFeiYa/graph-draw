import { Injectable } from "@nestjs/common";
import { SideBarDropDto } from "src/types/shape.dto";
import { SidebarModel } from "../models/SidebarModel";
import { InjectRepository } from "@nestjs/typeorm";
import { ShapeEntity } from "src/entities/shape.entity";
import { Repository } from "typeorm";

@Injectable()
export class ShapeService {
    constructor(
        @InjectRepository(ShapeEntity)
        private shapeRepository: Repository<ShapeEntity>
    ) {}
    async sideBarItemDrop(dto: SideBarDropDto) {
        const options: SideBarDropDto = {
            projectId: dto.projectId,
            diagramId: dto.diagramId,
            point: dto.point,
            sourceType: dto.sourceType,
            // targetShapeId: 
        }
        const sideBar = new SidebarModel(options);
        await sideBar.run();
        await this.shapeRepository.save([...sideBar.createdShapes])
    }
}