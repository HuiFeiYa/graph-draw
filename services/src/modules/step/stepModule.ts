import { Module, forwardRef } from "@nestjs/common";
import { StepService } from "./stepService";
import { StepController } from "./stepController";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StepEntity } from "src/entities/step.entity";
import { CurrentStepModule } from "../currentStep/currentStepModule";
import { ShapeModule } from "../shape/shape.module";
import { WsModule } from "../socket/wsModule";
import { ShapeEntity } from "src/entities/shape.entity";


@Module({
    controllers: [StepController]
})
export class StepModule {

}