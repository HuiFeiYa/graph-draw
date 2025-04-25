import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainDataSource } from './database/main-datasource';
import { MainModule } from './modules/main/main.module';
import { ProjectModule } from './modules/project/project.module';
import { ShapeModule } from './modules/shape/shape.module';


@Module({
  imports: [
    TypeOrmModule.forRoot(MainDataSource.options),
    MainModule, // 导入主模块
    ProjectModule,
    ShapeModule,
    // StepModule,
    // CurrentStepModule
  ],
})
export class AppModule {}
