import { Module } from '@nestjs/common';
import { MainModule } from './modules/main/main.module';
import { ProjectModule } from './modules/project/project.module';
import { ShapeModule } from './modules/shape/shape.module';
import { StepModule } from './modules/step/stepModule';
import { CurrentStepModule } from './modules/currentStep/currentStepModule';


@Module({
  imports: [
    MainModule, // 导入主模块
    ProjectModule,
    ShapeModule,
    StepModule,
    CurrentStepModule
  ],
})
export class AppModule {}
