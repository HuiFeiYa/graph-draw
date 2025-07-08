import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainController } from './main.controller';
import { MainService } from './main.service';
import { ApplicationProject } from 'src/entities/applicationProject.entity';
import { loggerUtils } from 'src/utils/LoggerUtils';
import { LogData } from 'src/types/common';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db/application.db',
      entities: [ApplicationProject],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ApplicationProject]), // 注册主数据库的实体
  ],
  controllers: [MainController],
  providers: [MainService],
  exports: [MainService]
})
export class MainModule {
  constructor() {
    // 记录模块初始化
    loggerUtils.logToFile(new LogData('MainModule 已初始化', 'log'));
  }
}