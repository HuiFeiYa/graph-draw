import { Body, Controller, Post } from '@nestjs/common';
import { ProjectService } from './project.services';
import { ResData } from 'src/utils/http/ResData';
import { getUid } from 'src/utils/common';
import { BaseProjectDto } from 'src/types/shape.dto';
import { transaction } from 'src/utils/transaction';
@Controller('project')
export class ProjectController {
  constructor() {}
  @Post('open')
  async openProjectNew(@Body() dto) {
  }
  @Post('create')
  async createProject(@Body() dto) {
    return  transaction({ lockProject: true }, async stepManager => {
      // 所有数据库操作都要在这个方法里完成，并且都要加await

      const project = await stepManager.projectService.createProject(dto);

      const res = new ResData(project);

      return res;
    });
    // const projectId = getUid();
    // const params = {
    //   ...dto,
    //   projectId
    // }
    // await this.projectService.createProject(params);
    // return new ResData();
  }
  @Post('save')
  async saveProject(@Body() dto) {
   
  }
}
