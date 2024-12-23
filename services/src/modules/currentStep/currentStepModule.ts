import { Module } from "@nestjs/common";
import { CurrentStepService } from "./currentStepService";



@Module({
    providers: [CurrentStepService],
    exports: [CurrentStepService]
})
export class CurrentStepModule {

}