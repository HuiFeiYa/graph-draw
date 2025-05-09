import * as JsZip from 'jszip';
import { projectZipFileName } from 'src/constants';
import { StepManager } from 'src/utils/StepManager';
import { Repository } from 'typeorm';
import { ApplicationProject } from 'src/entities/applicationProject.entity';
import { getUid } from 'src/utils/common';
import { pcmm } from 'src/utils/ConnectionManager';
import * as fs from 'fs/promises';
import { resolve } from 'path';
import { Project } from 'src/entities/project.entity';
export class ProjectService {
  constructor(public stepManager: StepManager) {}
  get manager() {
    return this.stepManager.manager;
  }
  private _projectMainRep: Repository<ApplicationProject>;
  private _projectRep: Repository<Project>

  /**
   * 系统数据库的
   */
  get projectMainRep() {
    return (
      this._projectMainRep ||
      (this._projectMainRep = this.manager.getRepository(ApplicationProject))
    );
  }
/**
   * 项目数据库的
   */
  get projectRep() {
    return (
      this._projectRep ||
      (this._projectRep = this.manager.getRepository(Project))
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
  async saveProject(dto: {projectId: string}) {
    if (!dto?.projectId) {
      throw new Error('projectId is required');
    }
    const project = await this.projectMainRep.findOneBy({ projectId: dto.projectId });
    if (!project) {
      throw new Error(`Project not found: ${dto.projectId}`);
    }
    const zip = new JsZip();
    zip.file(projectZipFileName.config, JSON.stringify(project));

    const sqlite = (this.stepManager.projectManager.connection.driver as any).databaseConnection; // 获取底层betterSqlite3的Database实例
    console.time('sqlite.serialize');
    const projectDbBuffer = sqlite.serialize();
    console.timeEnd('sqlite.serialize');
    zip.file(projectZipFileName.projectDB, projectDbBuffer);
    const arrayBUffer = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 3 } });
    const savePath = resolve(process.cwd(), `${dto.projectId}.draw`);
    await fs.writeFile(savePath, arrayBUffer);
    return savePath;
  }
  // 生成一个ZIP文件的缓冲区（ArrayBuffer）
  async generateZip(projectId) {}

  async openProject(dto) {}
}
