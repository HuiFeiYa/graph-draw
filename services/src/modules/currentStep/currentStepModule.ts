import { Module } from "@nestjs/common";
import { CurrentStepService } from "./currentStepService";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CurrentStep } from "src/entities/currentStep.entity";
import { loggerUtils } from "src/utils/LoggerUtils";
import { LogData } from "src/types/common";

@Module({
    imports:[
        TypeOrmModule.forFeature([CurrentStep])
    ],
    providers: [CurrentStepService],
    exports: [CurrentStepService]
})
export class CurrentStepModule {
    constructor() {
        // 记录模块初始化
        loggerUtils.logToFile(new LogData('CurrentStepModule 已初始化', 'log'));
    }
}