import * as AsyncLock from "async-lock";
import { dbConfig } from "src/database/config";
import { Connection, createConnection } from "typeorm";
import { getUid } from "./common";
import { resourceUtil } from "./ResourceUtil";
import { existsSync } from "fs";
import { join } from "path";
import { ResException } from "./http/ResException";
import { ApiCode } from "./http/ApiCode";
import { ProjectEntityList } from "src/entities";
export type ExtConnection = Connection & {inUse?:boolean}
/**
 * 项目数据库连接管理器
 * 负责project.db的连接池维护，自动创建数据库连接
 * 写数据用一个连接，串行写数据
 * 读数据用多个连接，并行读数据
 *
 * sqlite3限制一个连接只能同时启动一个事务
 */
export class ProjectConnectionManager {

  writeConnection: ExtConnection

  readConnections:ExtConnection[] = []

  readConnectionCount=0
  // projectId:string
  maxConnSize=1000

  lock = new AsyncLock()
  readonly LOCK='LOCK'

  noTransactionConnection: Connection

  /**
   *
   * @param dataBaseName 数据库名称，为了支持一个项目可以打开多个版本或者打开多次
   */
  constructor(public dataBaseName:string) {
    // if (!dataBaseName) {
    //   this.dataBaseName = ProjectConnectionManager.getProjectDbName(projectId);
    // }
  }

  /**
   * 获得项目数据库的写连接
   * @param autoConnect 如果连接已断开或未建立，是否自动建立数据库连接
   * @returns
   */
  async getWriteConnection(autoConnect = false, autoCreateDb = false) {
    return this.lock.acquire(this.LOCK, async () => {
      if (this.writeConnection) {
        if (autoConnect && !this.writeConnection.isConnected) {
          await this.writeConnection.connect();
        }
        return this.writeConnection;
      } else {
        const conn = await this.createProjectConnection(this.dataBaseName, false, autoCreateDb);
        if (autoConnect && !conn.isConnected) {
          await conn.connect();
        }
        this.writeConnection = conn;
        return conn;
      }
    });

  }
  /**
   * 写连接是否被占用
   * @returns
   */
  isBusy() {
    return this.lock.isBusy(this.LOCK);

  }

  /**
   * 获取一个读连接，获取成功后读连接会被标记为inUse
   * inUse的连接不会再被其他方法使用，指导其被标记为false
   *
   * 在连接使用完毕后，需要将连接标记为inUse=false
   *
   * @returns
   */
  async getReadConnection() {

    return this.lock.acquire(this.LOCK, async () => {
      // console.log('getReadConnection conn size', this.readConnections.length);
      try {

        const readConn = this.readConnections.find(it => !it.inUse);
        if (readConn) {
          // console.log(readConn.name);
          readConn.inUse = true;
          return readConn;
        } else {
          // 不存在可用的连接则创建
          if (this.readConnections.length > this.maxConnSize) {
            throw new Error('too many connection');
          }
          const conn = await this.createProjectConnection(this.dataBaseName, true);
          this.readConnections.push(conn);
          conn.inUse = true;
          // console.log(conn.name);
          return conn;
        }
      } finally {
        // console.log('getReadConnection conn size', this.projectId, this.readConnections.length);

      }
    });

  }

  /**
   * 获得一个不执行事务的数据库连接
   * @param autoConnect
   * @returns
   */
  async getNoTransactionConnection(autoConnect = false) {
    return this.lock.acquire(this.LOCK, async () => {
      if (this.noTransactionConnection) {
        if (autoConnect && !this.noTransactionConnection.isConnected) {
          await this.noTransactionConnection.connect();

        }
        return this.noTransactionConnection;
      } else {
        const conn = await this.createProjectConnection(this.dataBaseName, true);
        this.noTransactionConnection = conn;
        if (autoConnect && !conn.isConnected) {
          await conn.connect();

        }
        return conn;
      }
    });
  }

  /**
   * 创建一个项目的数据库连接
   * @param projectId
   * @param isRead 是否为读连接
   * @param autoCreateDb 是否自动创建数据库文件，如果是false，则会检查数据文件是否存在，不存在则会报错，只有新建项目时才应该传true
   * @returns
   */
  async createProjectConnection(dataBaseName:string, isRead = false, autoCreateDb = false) {
    // console.log('createProjectConnection');
    const config = dbConfig as any;
    // const dataBaseName = this.dataBaseName;
    let connectionName = isRead ? dataBaseName + '_read_' + getUid() : dataBaseName + '_write';
    // console.log(connectionName);
    if (!autoCreateDb) {
    // 必须校验当前项目db文件已存在，否则会自动创建空的db文件
    const dbPath = join(resourceUtil.projectDbDir, `${dataBaseName}.db`);
    console.log("resourceUtil.projectDbDir:",resourceUtil.projectDbDir)
    console.log('dbPath:',dbPath);
      const existFile = existsSync(dbPath);
      if (!existFile) {
        throw new ResException(ApiCode.NO_TIP_ERROR, "项目不存在");
      }
    }

    const connection = await createConnection({
      ...config,

      name: connectionName,

      // type: config.type as 'mysql',
      // host: config.host,
      // port: config.port,
      // username: config.username,
      // password: config.password,
      // multipleStatements: true,
      entities: [...ProjectEntityList],
      database: `./db/${dataBaseName}.db`
      // database
    });
    // await connection.connect();
    // if (synchronize) {
    //   await connection.synchronize();

    // }
    return connection as ExtConnection;

  }
  /**
   * 关闭项目的所有数据库连接
   * 一般在关闭项目时调用
   */
  async closeAllConnection() {
    await this.writeConnection?.close();
    for (let conn of this.readConnections) {
      await conn.close();
    }
    await this.noTransactionConnection?.close();
  }
}
/**
 * pcm: ProjectConnectionManager
 * PCMM: ProjectConnectionManagerManager
 * 项目数据库连接管理器的管理器
 *
 * 单例，用于管理每个项目的连接池，提供便捷调用方法
 */
export class PCMM {
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
  removePcm(dataBaseName:string) {

    this.pcmMap.delete(dataBaseName);
  }

  getReadConn(dataBaseName:string) {

    this.addPcm(dataBaseName);
    const pcm = this.getPcm(dataBaseName);
    return pcm.getReadConnection();
  }
  getWriteConn(dataBaseName:string, autoConnect = false) {
    this.addPcm(dataBaseName);
    const pcm = this.getPcm(dataBaseName);
    return pcm.getWriteConnection(autoConnect);

  }
  getWriteConnByProjectId(projectId:string, autoConnect = false, autoCreateDb = false) {
    const dataBaseName = resourceUtil.getProjectDbName(projectId);

    this.addPcm(dataBaseName);
    const pcm = this.getPcm(dataBaseName);
    return pcm.getWriteConnection(autoConnect, autoCreateDb);

  }
  getNoTransactionConnection(dataBaseName:string, autoConnect = false) {
    this.addPcm(dataBaseName);
    const pcm = this.getPcm(dataBaseName);
    return pcm.getNoTransactionConnection(autoConnect);
  }
  getNoTransactionConnectionByProjectId(projectId:string, autoConnect = false) {
    const dataBaseName = resourceUtil.getProjectDbName(projectId);

    this.addPcm(dataBaseName);
    const pcm = this.getPcm(dataBaseName);
    return pcm.getNoTransactionConnection(autoConnect);
  }
  async closePcm(dataBaseName:string) {
    const pcm = this.getPcm(dataBaseName);
    if (!pcm) {
      return;
    }
    await pcm.closeAllConnection();
    this.removePcm(dataBaseName);

  }

  async closePcmByProjectId(projectId:string) {
    const dataBaseName = resourceUtil.getProjectDbName(projectId);

    const pcm = this.getPcm(dataBaseName);
    if (!pcm) {
      return;
    }
    await pcm.closeAllConnection();
    this.removePcm(dataBaseName);

  }
  async closeAllPcm() {
    this.pcmMap.forEach((it, key) => {
      this.closePcm(key).catch(err => {
        console.error(err);
      });
    });

  }
}

export const pcmm = new PCMM();