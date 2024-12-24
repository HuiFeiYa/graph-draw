import { Module } from "@nestjs/common";
import { CurrentStepService } from "./currentStepService";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CurrentStep } from "src/entities/currentStep.entity";



@Module({
    imports:[
        TypeOrmModule.forFeature([CurrentStep])
    ],
    providers: [CurrentStepService],
    exports: [CurrentStepService]
})
export class CurrentStepModule {

}