import { Controller, Post, Body } from '@nestjs/common';
import { ProjectTemplateService } from './projectTemplate.service';
import { transaction } from 'src/utils/transaction';
import { ResData } from 'src/utils/http/ResData';
@Controller('template')
export class ProjectTemplateController {
  constructor() {}

  @Post('exportTemplate')
  async exportTemplate(@Body() dto: { projectId: string; name: string; description?: string }) {
    return transaction({
      projectId: dto.projectId,
    }, async (stepManager) => {
        const res = await stepManager.projectTemplateService.createTemplate(dto.projectId, dto.name, dto.description);
        return new ResData(res);
    });
  }
} 