import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MainDataSource } from './database/main-datasource';
import { MainModule } from './modules/main/main.module';
import { ProjectModule } from './modules/project/project.module';
import { ShapeModule } from './modules/shape/shape.module';
import { WsModule } from './modules/socket/wsModule';
import { StepModule } from './modules/step/stepModule';
import { CurrentStepModule } from './modules/currentStep/currentStepModule';


@Module({
  imports: [
    TypeOrmModule.forRoot(MainDataSource.options),
    MainModule, // 导入主模块
    ProjectModule,
    ShapeModule,
    WsModule,
    // StepModule,
    // CurrentStepModule
  ],
})
export class AppModule {}
