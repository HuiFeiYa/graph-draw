import { Body, Post } from '@nestjs/common';
import { ProjectService } from './project.services';

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @Post('open')
  async openProjectNew(@Body() dto) {
    await this.projectService.openProject_New();
  }
}
