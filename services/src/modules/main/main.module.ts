import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainController } from './main.controller';
import { MainService } from './main.service';
import { ApplicationProject } from 'src/entities/applicationProject.entity';
import { MAIN_DATA_SOURCE_NAME } from 'src/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationProject], MAIN_DATA_SOURCE_NAME), // 注册主数据库的实体
  ],
  controllers: [MainController],
  providers: [MainService],
})
export class MainModule {}