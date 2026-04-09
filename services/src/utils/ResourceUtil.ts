import { join, resolve } from "path";
import { formatTime } from "./common";
import { existsSync, mkdirSync } from "fs";
const isDevelopment = process.argv.includes('--development');
// 生产环境：D:\sourcecode\draw\hfdraw\apps\draw-client\release\win-unpacked\nodeServer
const arv1 = process.argv[1];

/**
 * webpack：rootDir: /Users/huifei/Documents/playground/draw/hfdraw/services/dist
 */
// 生产目录如此，开发环境后续保持一致
const rootDir = resolve(arv1, '../../');

class ResourceUtil {
  readonly rootDir = rootDir;
  readonly projectDbDir = isDevelopment ? join(this.rootDir, '../db') : join(this.rootDir, './db');
  readonly logsDir = join(this.rootDir, './logs');
  
  // 使用 getter，每次访问时重新计算路径
  get logFilePath() {
    return join(this.logsDir, `hfdraw.${formatTime(Date.now(), 'YYYY-MM-DD_HH-mm-ss')}.log`);
  }

  constructor() {

    // 检查 logs 目录是否存在，不存在则创建
    if (!existsSync(this.logsDir)) {
      try {
        mkdirSync(this.logsDir, { recursive: true }); // recursive: true 确保父目录不存在时也能创建
        console.log(`日志目录已创建: ${this.logsDir}`);
      } catch (error) {
        console.error(`创建日志目录失败: ${error.message}`);
        throw error;
      }
    } else {
      console.log(`日志目录已存在: ${this.logsDir}`);
    }

    // 检查项目数据库目录
    if (!existsSync(this.projectDbDir)) {
      try {
        mkdirSync(this.projectDbDir, { recursive: true });
        console.log(`项目数据库目录已创建: ${this.projectDbDir}`);
      } catch (error) {
        console.error(`创建项目数据库目录失败: ${error.message}`);
      }
    } else {
      console.log(`项目数据库目录已存在: ${this.projectDbDir}`);
    }

  }

  getProjectDbPath(projectId: string) {
    const dbName = 'project_' + projectId;
    console.log(`获取项目数据库名称: ${dbName}`);
    return dbName;
  }
  
  getProjectDbFilePath(projectId: string) {
    const dbPath = join(this.projectDbDir, 'project_' + projectId + '.db');
    console.log(`获取项目数据库路径: ${dbPath}`);
    return dbPath;
  }
}

export const resourceUtil = new ResourceUtil();