import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShapeEntity } from "src/entities/shape.entity";
import { ShapeService } from "./shape.services";
import { ShapeController } from "./shape.controller";
import { WsModule } from "../socket/wsModule";
import { CurrentStepModule } from "../currentStep/currentStepModule";
import { StepModule } from "../step/stepModule";

@Module({
    imports: [
        TypeOrmModule.forFeature([ShapeEntity]),
        WsModule,
        CurrentStepModule,
        StepModule
    ],
    controllers: [ShapeController],
    providers: [ShapeService],
    exports: [ShapeService]

})
export class ShapeModule {}