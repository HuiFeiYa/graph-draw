import { appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { formatTime } from './common';
import { LogData } from 'src/types/common';

class LoggerUtils {
  private logsDir: string;
  private logFilePath: string;

  constructor() {
    // 延迟初始化，避免循环依赖
    this.logsDir = '';
    this.logFilePath = '';
  }

  // 初始化方法，在resourceUtil创建后调用
  initialize(logsDir: string, logFilePath: string) {
    this.logsDir = logsDir;
    this.logFilePath = logFilePath;
    console.log(`LoggerUtils 已初始化 - logsDir: ${logsDir}, logFilePath: ${logFilePath}`);
  }

  private ensureLogDirExists() {
    if (!this.logsDir) {
      console.error('LoggerUtils 未初始化，无法写入日志文件');
      return false;
    }
    
    try {
      if (!existsSync(this.logsDir)) {
        const fs = require('fs');
        fs.mkdirSync(this.logsDir, { recursive: true });
        console.log(`日志目录已创建: ${this.logsDir}`);
      }
      return true;
    } catch (error) {
      console.error('创建日志目录失败:', error);
      return false;
    }
  }

  // 简化的日志写入方法，使用同步操作避免阻塞
  logToFile(data: LogData) {
    try {
      if (!this.logFilePath) {
        console.error('LoggerUtils 未初始化，无法写入日志文件');
        console.log(`[${formatTime(new Date(), 'YYYY-MM-DD HH:mm:ss')}] ${data?.message || ''}`);
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
      
      // 输出到控制台
      console.log(`[LoggerUtils] ${logEntry.trim()}`);
      
      // 同步写入文件，不阻塞后续代码
      const fs = require('fs');
      fs.appendFileSync(this.logFilePath, logEntry);
      
    } catch (error) {
      console.error('LoggerUtils.logToFile failed:', error);
      // 即使写入失败，也要输出到控制台
      const timestamp = formatTime(new Date(), 'YYYY-MM-DD HH:mm:ss');
      console.log(`[${timestamp}] ${data?.message || ''}`);
    }
  }

  // 同步日志方法，用于关键错误情况
  logToFileSync(data: LogData) {
    try {
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

      const timestamp = formatTime(new Date(), 'YYYY-MM-DD HH:mm:ss');
      const message = data?.message || '';
      const logEntry = `[${timestamp}] ${message}\n`;
      
      console.log(`[LoggerUtils] ${logEntry.trim()}`);
      
      // 使用同步写入
      const fs = require('fs');
      fs.appendFileSync(this.logFilePath, logEntry);
      
    } catch (error) {
      console.error('LoggerUtils.logToFileSync failed:', error);
      const timestamp = formatTime(new Date(), 'YYYY-MM-DD HH:mm:ss');
      console.log(`[${timestamp}] ${data?.message || ''}`);
    }
  }
}

const loggerUtils = new LoggerUtils();
export { loggerUtils };