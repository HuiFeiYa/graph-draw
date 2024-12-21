import { Module } from "@nestjs/common";
import { StepService } from "./stepService";
import { StepController } from "./stepController";


@Module({
    controllers: [StepController],
    providers: [StepService],
    exports: [StepService]
})
export class StepModule {

}