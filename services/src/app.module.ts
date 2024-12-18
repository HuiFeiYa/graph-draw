import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainDataSource } from './database/main-datasource';
import { MainModule } from './modules/main/main.module';
import { ProjectModule } from './modules/project/project.module';
import { ShapeModule } from './modules/shape/shape.module';
import { WsService } from './modules/socket/WsService';

@Module({
  imports: [
    TypeOrmModule.forRoot(MainDataSource.options), // 注册主数据库
    MainModule, // 导入主模块
    ProjectModule,
    ShapeModule
  ],
  providers: [WsService]
})
export class AppModule {}
