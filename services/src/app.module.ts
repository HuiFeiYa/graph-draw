import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainDataSource } from './database/main-datasource';
import { ProjectDataSource } from './database/project-datasource';
import { MainModule } from './modules/main/main.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(MainDataSource.options), // 注册主数据库
    // TypeOrmModule.forRoot(ProjectDataSource.options), // 注册项目数据库
    MainModule, // 导入主模块
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
