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
    imports: [
        TypeOrmModule.forFeature([StepEntity]),
        TypeOrmModule.forFeature([ShapeEntity]),
        CurrentStepModule,
        forwardRef(() => ShapeModule),
        WsModule
    ],
    controllers: [StepController],
    providers: [StepService],
    exports: [StepService]
})
export class StepModule {

}