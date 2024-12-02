import { Injectable } from '@nestjs/common';
import { MainService } from '../main/main.service';
import * as JsZip from 'jszip';
import { projectZipFileName } from 'src/constants';
import { resourceUtil } from 'src/utils/ResourceUtil';
import { pcm } from 'src/utils/ConnectionManager';
import { writeFile } from 'fs/promises';
import { join } from 'path';
@Injectable()
export class ProjectService {
  constructor(private mainService: MainService) {}
  openProject_New(): string {
    return 'Hello World!';
  }
  async createProject(dto) {
    await this.mainService.createProject(dto);
  }
  async saveProject(dto) {
      const {projectId, dirPath, filename} = dto;
      const fullPath = join(dirPath, filename + '.hf')
      const arrayBuffer = await this.generateZip(projectId);
      // 写入文件
      await writeFile(fullPath, arrayBuffer);
  }
  // 生成一个ZIP文件的缓冲区（ArrayBuffer）
  async generateZip(projectId) {
    // 获取项目信息
    const project = await this.mainService.findProjectById(projectId);
    const projectStr = JSON.stringify(project);
    // 往zip中添加数据
    const zip = new JsZip();
    zip.file(projectZipFileName.config, projectStr)
    const dataBaseName = resourceUtil.getProjectDbName(projectId)
    const connection = await pcm.getConnection(dataBaseName);
    const sqlite = (connection.driver as any).databaseConnection; // 获取底层bettersqlite3的Database实例
    const projectDbBuffer = sqlite.serialize();
    zip.file(projectZipFileName.projectDB, projectDbBuffer);
    return zip.generateAsync({ type: 'uint8array', compression:'DEFLATE', compressionOptions: { level: 3 } })
  }
}
