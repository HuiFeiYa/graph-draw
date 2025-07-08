import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShapeEntity } from "src/entities/shape.entity";
import { ShapeService } from "./shape.services";
import { ShapeController } from "./shape.controller";
import { CurrentStepModule } from "../currentStep/currentStepModule";
import { StepModule } from "../step/stepModule";
import { loggerUtils } from "src/utils/LoggerUtils";
import { LogData } from "src/types/common";

@Module({
    controllers: [ShapeController],

})
export class ShapeModule {
    constructor() {
        // 记录模块初始化
        loggerUtils.logToFile(new LogData('ShapeModule 已初始化', 'log'));
    }
}