import { Injectable } from '@nestjs/common';
import { StepManager } from 'src/utils/StepManager';
import { SnapshotShape } from 'src/entities/snapshotShape.entity';
import { ProjectTemplate } from 'src/entities/projectTemplate.entity';
import { ShapeEntity } from 'src/entities/shape.entity';

@Injectable()
export class ProjectTemplateService {
  constructor(private readonly stepManager: StepManager) {}

  /**
   * 导出模板：根据 projectId 查询 shape，存快照到 SnapshotShape，再存 ProjectTemplate
   */
  async createTemplate(projectId: string, name: string, description?: string) {
    // 1. 查询所有 shape
    const shapes = await this.stepManager.shapeRep.find({ where: { projectId, isDelete: false } });
    // 2. 存快照
    const snapshot = new SnapshotShape();
    snapshot.data = shapes;
    const savedSnapshot = await this.stepManager.snapshotShapeRep.save(snapshot);
    // 3. 存模板
    const template = new ProjectTemplate();
    template.name = name;
    template.description = description;
    template.snapshotId = savedSnapshot.id;
    const savedTemplate = await this.stepManager.projectTemplateRep.save(template);
    return savedTemplate;
  }
} 