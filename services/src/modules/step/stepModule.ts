import { Module, forwardRef } from "@nestjs/common";
import { StepController } from "./stepController";
import { loggerUtils } from "src/utils/LoggerUtils";
import { LogData } from "src/types/common";

@Module({
    controllers: [StepController]
})
export class StepModule {
    constructor() {
        // 记录模块初始化
        loggerUtils.logToFile(new LogData('StepModule 已初始化', 'log'));
    }
}