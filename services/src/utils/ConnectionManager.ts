import { dbConfig } from "src/database/config";
import { existsSync } from "fs";
import { resolve } from "path";
import { DataSource, DataSourceOptions } from "typeorm";
import { getUid } from "./common";
export class ProjectConnectionManager {
    /**
   * 创建一个项目的数据库连接
   * @param projectId
   * @param isRead 是否为读连接
   * @param autoCreateDb 是否自动创建数据库文件，如果是false，则会检查数据文件是否存在，不存在则会报错，只有新建项目时才应该传true
   * @returns
   */
  async createProjectConnection(dataBaseName:string, isRead = false) {
    let connectionName = isRead ? dataBaseName + '_read_' + getUid() : dataBaseName + '_write';
    const options: DataSourceOptions = {
        "type": "better-sqlite3",
        "entities": [],
        "synchronize": false,
        name: connectionName,
        database: resolve(__dirname, `../db/${dataBaseName}.db`)
        // database
      }
    const myDataSource  = new DataSource(options);
    // if (synchronize) {
    //   await connection.synchronize();

    // }
    return myDataSource;

  }
}