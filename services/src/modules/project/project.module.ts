import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.services';
import { MainModule } from '../main/main.module';
import { ShapeModule } from '../shape/shape.module';
import { loggerUtils } from 'src/utils/LoggerUtils';
import { LogData } from 'src/types/common';

@Module({
  controllers: [ProjectController]
})
export class ProjectModule {
  constructor() {
    // 记录模块初始化
    loggerUtils.logToFile(new LogData('ProjectModule 已初始化', 'log'));
  }
}