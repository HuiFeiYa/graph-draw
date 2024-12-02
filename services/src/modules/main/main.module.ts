import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainController } from './main.controller';
import { MainService } from './main.service';
import { ApplicationProject } from 'src/entities/applicationProject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationProject]), // 注册主数据库的实体
  ],
  controllers: [MainController],
  providers: [MainService],
  exports: [MainService]
})
export class MainModule {}