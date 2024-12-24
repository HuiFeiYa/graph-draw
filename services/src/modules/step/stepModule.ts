import { Module } from "@nestjs/common";
import { StepService } from "./stepService";
import { StepController } from "./stepController";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StepEntity } from "src/entities/step.entity";
import { CurrentStepModule } from "../currentStep/currentStepModule";


@Module({
    imports: [
        TypeOrmModule.forFeature([StepEntity]),
        CurrentStepModule
    ],
    controllers: [StepController],
    providers: [StepService],
    exports: [StepService]
})
export class StepModule {

}