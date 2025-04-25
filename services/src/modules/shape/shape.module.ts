import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShapeEntity } from "src/entities/shape.entity";
import { ShapeService } from "./shape.services";
import { ShapeController } from "./shape.controller";
import { CurrentStepModule } from "../currentStep/currentStepModule";
import { StepModule } from "../step/stepModule";

@Module({
    controllers: [ShapeController],

})
export class ShapeModule {}