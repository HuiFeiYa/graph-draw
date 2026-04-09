import { appendFileSync, mkdirSync } from 'fs';
import { existsSync } from 'fs';
import { formatTime } from './common';
import { LogData } from 'src/types/common';
import { resourceUtil } from './ResourceUtil';

const isDevelopment = process.argv.includes('--development');
console.log('isDevelopment:', isDevelopment);
const arv1 = process.argv[1];
class LoggerUtils {
  private logsDir: string | null = null;
  private logFilePath: string | null = null;

  constructor() {
    /**
     * 开发环境：
     *  rootDir: D:\sourcecode\draw\hfdraw\services\dist
        projectDbDir: D:\sourcecode\draw\hfdraw\services\db
        logsDir: D:\sourcecode\draw\hfdraw\services\dist\logs
        logFilePath: D:\sourcecode\draw\hfdraw\services\dist\logs\hfdraw.2025-07-09_15-05-03.log
        arv1: D:\sourcecode\draw\hfdraw\services\dist\src\main
        argv: C:\Users\admin\AppData\Local\Volta\tools\image\node\20.18.0\node.exe,D:\sourcecode\draw\hfdraw\services\dist\src\main,--development
     */
    /**
     * 生产环境：
     * rootDir: D:\sourcecode\draw\hfdraw\apps\draw-client\release\win-unpacked\nodeServer
      projectDbDir: D:\sourcecode\draw\hfdraw\apps\draw-client\release\win-unpacked\nodeServer\db
      logsDir: D:\sourcecode\draw\hfdraw\apps\draw-client\release\win-unpacked\nodeServer\logs
      logFilePath: D:\sourcecode\draw\hfdraw\apps\draw-client\release\win-unpacked\nodeServer\logs\hfdraw.2025-07-09_15-00-30.log
      arv1: D:\sourcecode\draw\hfdraw\apps\draw-client\release\win-unpacked\nodeServer\dist\main.js
     */
    const initInfo = `ResourceUtil 初始化:
    rootDir: ${resourceUtil.rootDir}
    projectDbDir: ${resourceUtil.projectDbDir}
    logsDir: ${resourceUtil.logsDir}
    logFilePath: ${resourceUtil.logFilePath}
    arv1: ${arv1}
    argv: ${process.argv.toString()}`;
;
    this.logToFile(new LogData(initInfo, 'log'));
  }

  private ensureLogDirExists() {
    if (!this.logsDir || !this.logFilePath) {
      this.logsDir = resourceUtil.logsDir;
      this.logFilePath = resourceUtil.logFilePath;
    }
    
    if (!this.logsDir) {
      console.error('LoggerUtils 未初始化，无法写入日志文件');
      return false;
    }
    
    try {
      if (!existsSync(this.logsDir)) {
        mkdirSync(this.logsDir, { recursive: true });
        if (isDevelopment) {
          console.log(`日志目录已创建: ${this.logsDir}`);
        } else {
          this.logToFile({ message: `日志目录已创建: ${this.logsDir}` });
        }
      }
      return true;
    } catch (error) {
      if (isDevelopment) {
        console.error('创建日志目录失败:', error);
      } else {
        this.logToFile({ message: `创建日志目录失败: ${error}` });
      }
      return false;
    }
  }

  // 简化的日志写入方法，使用同步操作避免阻塞
  logToFile(data: LogData) {
    try {
      if (isDevelopment) {
        // 开发环境：直接输出到控制台
        const timestamp = formatTime(new Date(), 'YYYY-MM-DD HH:mm:ss');
        console.log(`[${timestamp}] ${data?.message || ''}`);
        return;
      }

      // 生产环境：写入日志文件
      if (!this.logFilePath) {
        this.logsDir = resourceUtil.logsDir;
        this.logFilePath = resourceUtil.logFilePath;
      }

      if (!this.logFilePath) {
        console.error('LoggerUtils 未初始化，无法写入日志文件');
        const timestamp = formatTime(new Date(), 'YYYY-MM-DD HH:mm:ss');
        console.log(`[${timestamp}] ${data?.message || ''}`);
        return;
      }

      // 确保日志目录存在
      if (!this.ensureLogDirExists()) {
        return;
      }

      // 简化的日志格式：时间 + 消息
      const timestamp = formatTime(new Date(), 'YYYY-MM-DD HH:mm:ss');
      const message = data?.message || '';
      const logEntry = `[${timestamp}] ${message}\n`;
      
      // 同步写入文件，不阻塞后续代码
      appendFileSync(this.logFilePath, logEntry);
      
    } catch (error) {
      console.error('LoggerUtils.logToFile failed:', error);
      // 即使写入失败，也要输出到控制台
      const timestamp = formatTime(new Date(), 'YYYY-MM-DD HH:mm:ss');
      console.log(`[${timestamp}] ${data?.message || ''}`);
    }
  }
}

const loggerUtils = new LoggerUtils();
export { loggerUtils };