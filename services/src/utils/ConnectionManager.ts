import { resolve } from "path";
import { DataSource } from "typeorm";
import { getUid } from "./common";
import { ProjectEntityList } from 'src/entities';
import { resourceUtil } from "./ResourceUtil";

export class ProjectConnectionManager {
  pcmMap = new Map<string, ProjectConnectionManager>()
  constructor(public dataBaseName:string) {
  }
    /**
   * 创建一个项目的数据库连接
   */
  async createProjectConnection(dataBaseName:string) {
    const connectionName = dataBaseName + '_'+ getUid();
    const databasePath = resolve(__dirname, `./db/${connectionName}.db`);
    const dataSource =  new DataSource({
        type: 'better-sqlite3',
        database: databasePath, // 项目数据库文件路径
        entities: ProjectEntityList, // 项目数据库实体
        synchronize: true, // 开发环境中开启同步表结构，生产环境应关闭
        logging: false,
    })
    return dataSource;
  }
  async getConnection() {
    const connection = await this.createProjectConnection(this.dataBaseName)
    await connection.initialize()
    return connection;
  }
}

export class PCM {
  pcmMap = new Map<string, ProjectConnectionManager>()
  getPcm(dataBaseName:string) {
    return this.pcmMap.get(dataBaseName);
  }
  getPcmByProjectId(projectId:string) {
    const dataBaseName = resourceUtil.getProjectDbName(projectId);
    return this.pcmMap.get(dataBaseName);
  }
  addPcm(dataBaseName:string) {
    if (this.pcmMap.has(dataBaseName)) return;
    this.pcmMap.set(dataBaseName, new ProjectConnectionManager(dataBaseName));
  }
  getConnection(dataBaseName:string) {
    this.addPcm(dataBaseName);
    const pcm = this.getPcm(dataBaseName);
    return pcm.getConnection();
  }
}

export const pcm = new PCM();