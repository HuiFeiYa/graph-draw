import { join, resolve } from "path";
import { formatTime } from "./common";
import { existsSync, mkdirSync } from "fs";
import { loggerUtils } from "./LoggerUtils";
import { LogData } from "src/types/common";
const arv1 = process.argv[1];
console.log('arv1:',arv1)
/**
 * webpack：rootDir: /Users/huifei/Documents/playground/draw/hfdraw/services/dist
 */
// 生产目录如此，开发环境后续保持一致
console.log('rootDir:', resolve(arv1, '../../'))
loggerUtils.logToFile(new LogData('rootDir:'+resolve(arv1, '../../'), 'log'));

class ResourceUtil {
  readonly rootDir = resolve(arv1, '../../')
  readonly projectDbDir = join(this.rootDir, '../db')
  readonly logsDir = join(this.rootDir, './logs')
   // 使用 getter，每次访问时重新计算路径
  get logFilePath() {
    return join(this.logsDir, `hfdraw.${formatTime(Date.now(), 'YYYY-MM-DD_HH-mm-ss')}.log`);
  }
  constructor() {
    // 检查 logs 目录是否存在，不存在则创建
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true }); // recursive: true 确保父目录不存在时也能创建
    }
  }
  
  getProjectDbName(projectId: string) {
    return 'project_' + projectId;
  }
  getProjectDbFilePath(projectId:string) {
    console.log('---------this.projectDbDir--------', this.projectDbDir);
    return join(this.projectDbDir, 'project_' + projectId + '.db');
  }
}


export const resourceUtil = new ResourceUtil();