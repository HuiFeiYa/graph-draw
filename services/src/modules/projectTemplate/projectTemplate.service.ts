import { Injectable } from '@nestjs/common';
import { StepManager } from 'src/utils/StepManager';
import { SnapshotShape } from 'src/entities/snapshotShape.entity';
import { ProjectTemplate } from 'src/entities/projectTemplate.entity';
import { ShapeEntity } from 'src/entities/shape.entity';
import { getUid } from 'src/utils/common';
import { ShapeType } from '@hfdraw/types';

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

  async findAllTemplates() {
    return this.stepManager.projectTemplateRep.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * 应用模板到项目
   */
  async applyTemplateToProject(projectId: string, templateId: number) {
    // 1. 将当前项目所有 shape 的 isDelete 置为 true
    const shapes = await this.stepManager.shapeRep.find({ where: { projectId, isDelete: false } });
    for (const shape of shapes) {
      shape.isDelete = true;
      shape.isDeleteChanged = true;
    }
    await this.stepManager.shapeService.updateShapeChanges(shapes);
    // 2. 查询模板快照
    const template = await this.stepManager.projectTemplateRep.findOne({ where: { id: templateId } });
    if (!template) throw new Error('模板不存在');
    const snapshot = await this.stepManager.snapshotShapeRep.findOne({ where: { id: template.snapshotId } });
    if (!snapshot) throw new Error('模板快照不存在');
    // 3. 拷贝快照中的 shape 到当前项目
    const oldToNewIdMap = new Map<string, string>();

    // 1. 先处理非 edge 图形
    const nodeShapes = (snapshot.data || []).filter(s => s.shapeType !== ShapeType.Edge);
    const nodeShapesToCreate = nodeShapes.map(shape => {
      const { id_, id, projectId: oldProjectId, ...rest } = shape;
      const newId = getUid();
      oldToNewIdMap.set(id, newId);
      return {
        ...rest,
        id: newId,
        projectId,
      };
    });

    // 2. 再处理 edge 图形
    const edgeShapes = (snapshot.data || []).filter(s => s.shapeType === ShapeType.Edge);
    const edgeShapesToCreate = edgeShapes.map(shape => {
      const { id_, id, projectId: oldProjectId, sourceId, targetId, ...rest } = shape;
      const newId = getUid();
      oldToNewIdMap.set(id, newId);
      return {
        ...rest,
        id: newId,
        projectId,
        sourceId: sourceId ? oldToNewIdMap.get(sourceId) : sourceId,
        targetId: targetId ? oldToNewIdMap.get(targetId) : targetId,
      };
    });
    const addShapes = [...nodeShapesToCreate, ...edgeShapesToCreate];
    if (addShapes) {
      await this.stepManager.shapeService.addShapeChanges(addShapes);
    }
    return { success: true };
  }
} 