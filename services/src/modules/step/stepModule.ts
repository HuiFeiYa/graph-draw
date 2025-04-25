import { Module, forwardRef } from "@nestjs/common";
import { StepController } from "./stepController";

@Module({
    controllers: [StepController]
})
export class StepModule {

}