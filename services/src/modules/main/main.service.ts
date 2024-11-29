import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MAIN_DATA_SOURCE_NAME } from 'src/constants';
import { MainDataSource } from 'src/database/main-datasource';
import { ApplicationProject } from 'src/entities/applicationProject.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MainService {
  constructor(
    @InjectRepository(ApplicationProject, MAIN_DATA_SOURCE_NAME) // 指定主数据库
    private appRepository: Repository<ApplicationProject>,
  ) {}

  getProject(){
    return this.appRepository.find();
  }
}