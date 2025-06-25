import { appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { resourceUtil } from './ResourceUtil';
import { formatTime } from './common';
import { LogData } from 'src/types/common';





class LoggerUtils {
  private async ensureLogDirExists() {
    if (!existsSync(resourceUtil.logsDir)) {
      await mkdir(resourceUtil.logsDir, { recursive: true });
    }
  }

  private formatLog(data: LogData) {
    return JSON.stringify({
      timestamp: formatTime(new Date(), 'yyyy-MM-dd'),
      level: data.level || 'INFO',
      ...data,
    });
  }

  async logToFile(data: LogData) {
    try {
      await this.ensureLogDirExists();
      
      await appendFile(
        resourceUtil.logFilePath,
        this.formatLog(data) + ',\n'  // 换行+逗号适合JSON数组格式
      );
    } catch (error) {
      console.error('LoggerUtils.logToFile failed:', error);
      // 可以在这里添加备用日志方案（如发送到Sentry）
    }
  }
}
const loggerUtils = new LoggerUtils();
export { loggerUtils };