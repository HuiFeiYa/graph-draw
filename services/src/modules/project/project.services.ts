import { Injectable } from '@nestjs/common';
import { MainService } from '../main/main.service';

@Injectable()
export class ProjectService {
    // private mainService: MainService
  constructor(
    private mainService: MainService
  ) {

  }
  openProject_New(): string {
    return 'Hello World!';
  }
  async createProject(dto) {
    await this.mainService.createProject(dto);
  }
  async saveProject(dto) {
    const project = await this.mainService.findProjectById(dto.projectId);
    const projectStr = JSON.stringify(project);
    return projectStr
  }
}
