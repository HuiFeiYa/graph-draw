import { Controller, Post, Body, Get } from '@nestjs/common';
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

  @Post('applyTemplate')
  async applyTemplate(@Body() dto: { projectId: string; templateId: number }) {
    return transaction({ projectId: dto.projectId }, async (stepManager) => {
      const res = await stepManager.projectTemplateService.applyTemplateToProject(dto.projectId, dto.templateId);
      return new ResData(res);
    });
  }

  @Get('list')
  async getTemplateList(@Body() dto: { projectId?: string }) {
    return transaction({ projectId: dto.projectId }, async (stepManager) => {
      const res = await stepManager.projectTemplateService.findAllTemplates();
      return new ResData(res);
    });
  }
} 