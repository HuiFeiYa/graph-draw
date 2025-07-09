import { Module } from '@nestjs/common';
import { MainModule } from './modules/main/main.module';
import { ProjectModule } from './modules/project/project.module';
import { ShapeModule } from './modules/shape/shape.module';
import { StepModule } from './modules/step/stepModule';
import { CurrentStepModule } from './modules/currentStep/currentStepModule';
import { loggerUtils } from './utils/LoggerUtils';
import { LogData } from './types/common';
import { ProjectTemplateModule } from './modules/projectTemplate/projectTemplate.module';

@Module({
  imports: [
    MainModule, // 导入主模块
    ProjectModule,
    ShapeModule,
    StepModule,
    CurrentStepModule,
    ProjectTemplateModule
  ],
})
export class AppModule {
  constructor() {
    // 记录应用模块初始化
    loggerUtils.logToFile(new LogData('AppModule 已初始化，所有子模块已加载', 'log'));
  }
}
