import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.services';
import { MainModule } from '../main/main.module';
import { ShapeModule } from '../shape/shape.module';

@Module({
  imports: [
    MainModule,
    ShapeModule,
    TypeOrmModule.forFeature([Project]), // 注册主数据库的实体
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}