import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ResData } from 'src/utils/http/ResData';
import { transaction } from 'src/utils/transaction';

@Controller('project')
export class ProjectController {
  constructor() {}
  @Post('open')
  async openProjectNew(@Body() dto: {filePath: string}) {
    return transaction({ lockProject: true }, async stepManager => {
      await stepManager.projectService.openProject(dto);
      return new ResData(null);
    });
  }
  @Post('create')
  async createProject(@Body() dto) {
    return  transaction({ lockProject: true }, async stepManager => {
      // 所有数据库操作都要在这个方法里完成，并且都要加await

      const project = await stepManager.projectService.createProject(dto);

      const res = new ResData(project);

      return res;
    });
  }
  @Post('save')
  async saveProject(@Body() dto) {
    return transaction({
      lockProject: false,
      initStep: false,
      projectId: dto.projectId,
    }, async st => {
      await st.projectService.saveProject(dto);
      return new ResData(null);
    })
  }
  @Post('delete')
  async deleteProject(@Body() dto) {
    return transaction({
    }, async st => {
      await st.projectService.deleteProject(dto.projectId);
      return new ResData(null);
    });
  }
  @Get('unCloseList')
  async getUnCloseProjectList() {
    return transaction({}, async st => {
      const projects = await st.projectService.getUnCloseProjectList();
      return new ResData(projects);
    });
  }
  @Get('projectList')
  async getProjectList() {
    return transaction({}, async st => {
      const projects = await st.projectService.getProjectList();
      return new ResData(projects);
    });
  }
  @Get('commonConfig')
  async getCommonConfig(@Query('projectId') projectId: string) {
    return transaction({}, async st => {
      const config = await st.projectService.getCommonConfig(projectId);
      return new ResData(config);
    });
  }
  @Post('commonConfig')
  async updateCommonConfig(@Body() dto: { projectId: string, commonConfig: any }) {
    return transaction({}, async st => {
      const config = await st.projectService.updateCommonConfig(dto.projectId, dto.commonConfig);
      return new ResData(config);
    });
  }
}
