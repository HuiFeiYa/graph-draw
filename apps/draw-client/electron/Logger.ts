import { app } from 'electron';
import { resolve } from 'path';
import * as fs from 'fs';
import * as dayjs from 'dayjs';

const isDevelopment = process.env.NODE_ENV === 'development';

export class Logger {
  private logPath: string | undefined = undefined;
  private options: { flags: string; encoding: BufferEncoding } | undefined = undefined;

  constructor() {
    if (!isDevelopment) {
      const userDataPath = app.getPath("userData");
      const logDir = resolve(userDataPath, "./logs");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      this.logPath = resolve(
        logDir,
        `hfdraw.${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.log`
      );
      this.options = {
        flags: "a",
        encoding: "utf8",
      };
    }
  }

  private async writeLog(content: string, type: 'info' | 'error' = 'info') {
    if (isDevelopment) {
      console.log(`[${type.toUpperCase()}]`, content);
      return;
    }
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const logContent = `[${timestamp}][${type.toUpperCase()}] ${content}\n`;
    return new Promise<void>((resolve, reject) => {
      if (!this.logPath || !this.options) return resolve();
      fs.appendFile(this.logPath, logContent, this.options, (err) => {
        if (err) {
          console.error("写入日志失败:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public async info(content: string) {
    await this.writeLog(content, 'info');
  }

  public async error(content: string) {
    await this.writeLog(content, 'error');
  }
} 