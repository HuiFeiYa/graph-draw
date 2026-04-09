import { Module } from '@nestjs/common';
import { ProjectTemplateController } from './projectTemplate.controller';

@Module({
  controllers: [ProjectTemplateController],
})
export class ProjectTemplateModule {} 