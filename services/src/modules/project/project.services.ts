// @ts-ignore
import { Injectable } from '@nestjs/common';
import { MainService } from '../main/main.service';
import * as JsZip from 'jszip';
import { projectZipFileName } from 'src/constants';
import { resourceUtil } from 'src/utils/ResourceUtil';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { BaseProjectDto } from 'src/types/shape.dto';
import { ShapeService } from '../shape/shape.services';
import { StepManager } from 'src/utils/StepManager';
import { Repository } from 'typeorm';
import { ApplicationProject } from 'src/entities/applicationProject.entity';
import { getUid } from 'src/utils/common';
import { pcmm } from 'src/utils/ConnectionManager';
@Injectable()
export class ProjectService {
  constructor(public stepManager: StepManager) {}
  get manager() {
    return this.stepManager.manager;
  }
  private _projectMainRep: Repository<ApplicationProject>;

  /**
   * 系统数据库的
   */
  get projectMainRep() {
    return (
      this._projectMainRep ||
      (this._projectMainRep = this.manager.getRepository(ApplicationProject))
    );
  }
  async createProject(dto) {
    const p = new ApplicationProject();
    p.projectId = getUid();
    p.name = dto.name;
    p.createdAt = new Date();
    p.updatedAt = new Date();
    const connection = await pcmm.getWriteConnByProjectId(p.projectId, true, true);
    await connection.synchronize();
    await this.projectMainRep.save(p);
    return p;
  }

  async getUnCloseProjectList() {
    return this.projectMainRep.find({ where: {  dbClose: false } });
  }
  async getProjectList() {
    return this.projectMainRep.find();
  }
  async saveProject(dto) {}
  // 生成一个ZIP文件的缓冲区（ArrayBuffer）
  async generateZip(projectId) {}

  async openProject(dto) {}
}
