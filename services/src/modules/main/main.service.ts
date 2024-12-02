import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationProject } from 'src/entities/applicationProject.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MainService {
  constructor(
    @InjectRepository(ApplicationProject) // 指定主数据库
    private appRepository: Repository<ApplicationProject>,
  ) {}

  getProject(){
    return this.appRepository.find();
  }
  async createProject(dto) {
    const project = new ApplicationProject();
    Object.assign(project, dto)
    await this.appRepository.save(project);
  }
  async findProjectById(projectId) {
    const project = await this.appRepository.findOne({
        where: {
            projectId
        }
    })
    return project;
  }
}