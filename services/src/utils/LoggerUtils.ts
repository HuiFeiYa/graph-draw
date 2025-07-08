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

  private async ensureLogDirExists() {
    if (!this.logsDir) {
      throw new Error('LoggerUtils 未初始化，请先调用 initialize 方法');
    }
    
    try {
      if (!existsSync(this.logsDir)) {
        await mkdir(this.logsDir, { recursive: true });
        console.log(`日志目录已创建: ${this.logsDir}`);
      }
    } catch (error) {
      console.error('创建日志目录失败:', error);
      throw error;
    }
  }

  private formatLog(data: LogData) {
    const timestamp = formatTime(new Date(), 'YYYY-MM-DD HH:mm:ss');
    const level = data.level?.toUpperCase() || 'INFO';
    const message = data?.message || '';
    const stack = data?.stack || '';
    
    let formattedLog = `[${timestamp}] [${level}] ${message}`;
    
    if (stack) {
      // 如果stack是JSON字符串，格式化它
      try {
        const parsedStack = JSON.parse(stack);
        formattedLog += `\n详细信息:\n${JSON.stringify(parsedStack, null, 2)}`;
      } catch {
        // 如果不是JSON，直接添加
        formattedLog += `\n${stack}`;
      }
    }
    
    return formattedLog;
  }

  async logToFile(data: LogData) {
    try {
      if (!this.logFilePath) {
        console.error('LoggerUtils 未初始化，无法写入日志文件');
        console.log(`[LoggerUtils] ${this.formatLog(data)}`);
        return;
      }

      await this.ensureLogDirExists();
      
      const formattedLog = this.formatLog(data);
      const logEntry = formattedLog + '\n';
      
      // 同时输出到控制台和文件
      console.log(`[LoggerUtils] ${formattedLog}`);
      
      await appendFile(
        this.logFilePath,
        logEntry
      );
      
      // 记录日志写入成功（仅在调试模式下）
      if (process.env.NODE_ENV === 'development') {
        console.log(`日志已写入文件: ${this.logFilePath}`);
      }
      
    } catch (error) {
      console.error('LoggerUtils.logToFile failed:', error);
      
      // 尝试写入备用日志文件
      try {
        const fallbackPath = `${process.cwd()}/logs/fallback.log`;
        const fallbackDir = fallbackPath.substring(0, fallbackPath.lastIndexOf('/'));
        
        if (!existsSync(fallbackDir)) {
          await mkdir(fallbackDir, { recursive: true });
        }
        
        const fallbackLog = `[${formatTime(new Date(), 'YYYY-MM-DD HH:mm:ss')}] [ERROR] LoggerUtils.logToFile failed: ${error.message}\n原始日志: ${data?.message}\n`;
        await appendFile(fallbackPath, fallbackLog);
        
        console.log(`备用日志已写入: ${fallbackPath}`);
      } catch (fallbackError) {
        console.error('备用日志写入也失败:', fallbackError);
      }
    }
  }

  // 添加同步日志方法，用于关键错误情况
  logToFileSync(data: LogData) {
    try {
      if (!this.logFilePath) {
        console.error('LoggerUtils 未初始化，无法写入日志文件');
        console.log(`[LoggerUtils] ${this.formatLog(data)}`);
        return;
      }

      const formattedLog = this.formatLog(data);
      const logEntry = formattedLog + '\n';
      
      console.log(`[LoggerUtils] ${formattedLog}`);
      
      // 使用同步写入
      const fs = require('fs');
      if (!existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }
      
      fs.appendFileSync(this.logFilePath, logEntry);
      
    } catch (error) {
      console.error('LoggerUtils.logToFileSync failed:', error);
    }
  }
}

const loggerUtils = new LoggerUtils();
export { loggerUtils };