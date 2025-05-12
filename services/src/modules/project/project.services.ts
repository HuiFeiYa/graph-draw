import JSZip, * as JsZip from 'jszip';
import { projectZipFileName } from 'src/constants';
import { StepManager } from 'src/utils/StepManager';
import { Repository } from 'typeorm';
import { ApplicationProject } from 'src/entities/applicationProject.entity';
import { getUid } from 'src/utils/common';
import { pcmm } from 'src/utils/ConnectionManager';
import * as fs from 'fs/promises';
import { resolve } from 'path';
import { Project } from 'src/entities/project.entity';

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { ResException } from 'src/utils/http/ResException';
import { ApiCode } from 'src/utils/http/ApiCode';
import { App } from 'supertest/types';

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

  async deleteProject(projectId: string) {
    if (!projectId) {
      throw new Error('projectId is required');
    }
    const project = await this.projectMainRep.findOneBy({ projectId });
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }
    // 删除项目记录
    await this.projectMainRep.delete({ projectId });
    // 删除项目数据库文件
    const projectPath = resolve(process.cwd(), `${projectId}.draw`);
    try {
      await fs.unlink(projectPath);
    } catch (error) {
      console.error(`Failed to delete project file: ${error.message}`);
    }
  }

  // 生成一个ZIP文件的缓冲区（ArrayBuffer）
  async generateZip(projectId) {}

  async openProject(dto: {filePath: string}) {
    if (!existsSync(dto.filePath)) {
      console.error(dto.filePath);
      throw new ResException(ApiCode.ERROR, '文件不存在');
    }
    
    let buffer: Buffer;
    try {
      buffer = await readFile(dto.filePath);
    } catch (error) {
      console.error(`Error in openProject: ${error.message}`);
      if (error.code === 'EPERM') {
        throw new ResException(ApiCode.ERROR, '文件权限不足');
      } else {
        throw new ResException(ApiCode.ERROR, '文件读取失败');
      }
    }

    const zip = new JSZip();
    try {
      await zip.loadAsync(buffer);
      let projectStr = await zip.file(projectZipFileName.config).async('string');
      let project = JSON.parse(projectStr) as unknown as ApplicationProject;
      const existProject = await this.projectMainRep.findOneBy({ id: project.id });
      // return new ResData(project);
    } catch (error) {
      console.error(error);
      throw new ResException(ApiCode.ERROR, 'zip格式错误');
    }
  }
}
