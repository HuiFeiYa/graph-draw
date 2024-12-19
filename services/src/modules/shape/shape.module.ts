import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShapeEntity } from "src/entities/shape.entity";
import { ShapeService } from "./shape.services";
import { ShapeController } from "./shape.controller";
import { WsModule } from "../socket/wsModule";

@Module({
    imports: [
        TypeOrmModule.forFeature([ShapeEntity]),
        WsModule
    ],
    controllers: [ShapeController],
    providers: [ShapeService]
})
export class ShapeModule {}