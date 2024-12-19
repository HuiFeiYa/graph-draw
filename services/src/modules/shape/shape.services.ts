import { Injectable } from "@nestjs/common";
import { FetchAllShapeDto, SideBarDropDto } from "src/types/shape.dto";
import { SidebarModel } from "../models/SidebarModel";
import { InjectRepository } from "@nestjs/typeorm";
import { ShapeEntity } from "src/entities/shape.entity";
import { Repository } from "typeorm";
import { WsService } from "../socket/WsService";
import { WsMessageType } from "src/types/common";
import { ChangeType } from "@hfdraw/types";

@Injectable()
export class ShapeService {
    constructor(
        @InjectRepository(ShapeEntity)
        private shapeRepository: Repository<ShapeEntity>,
        private readonly wsService: WsService, // 注入 WsService
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
        const res = await this.shapeRepository.save([...sideBar.createdShapes])
        this.wsService.sendToSubscribedClient(dto.projectId, {
            type: WsMessageType.step,
            data: {
                projectId: dto.projectId,
                changes: res.map(item => {
                    return {
                        type: ChangeType.INSERT,
                        newValue: JSON.stringify(item),
                        projectId: dto.projectId
                    }
                })
            }
        })
    }
    async getDiagramAllShape(dto: FetchAllShapeDto) {
        const res = await this.shapeRepository.find({
            where: {
                projectId: dto.projectId
            }
        })
        return res;
    }
}