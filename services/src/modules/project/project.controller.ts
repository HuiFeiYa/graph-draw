import { Body, Controller, Post } from '@nestjs/common';
import { ProjectService } from './project.services';
import { ResData } from 'src/utils/http/ResData';
import { getUid } from 'src/utils/common';
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @Post('open')
  async openProjectNew(@Body() dto) {
    await this.projectService.openProject_New();
  }
  @Post('create')
  async createProject(@Body() dto) {
    const projectId = getUid();
    const params = {
      ...dto,
      projectId
    }
    await this.projectService.createProject(params);
    return new ResData();
  }
  @Post('save')
  async saveProject(@Body() dto) {
    await this.projectService.saveProject(dto);
    return new ResData();
  }
}
