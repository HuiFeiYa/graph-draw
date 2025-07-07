import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptionFilter/AllExceptionsFilter';
import { createConnection, DataSourceOptions } from 'typeorm';
import { resolve } from 'path';
import {
  READ_CONNECTION_NAME,
  WRITE_CONNECTION_NAME,
} from './utils/transaction';
import { SystemEntityList } from './entities';
import { LoggingInterceptor } from './interceptors/LoggingInterceptor';
import { loggerUtils } from './utils/LoggerUtils';
import { LogData } from './types/common';
// 打印 Node.js 版本和 ABI 版本（关键！）
const envInfo = `[Node 服务环境检查]
Node.js 版本: ${process.version}
NODE_MODULE_VERSION: ${process.versions.modules}  <-- 必须与 Electron 的 130 一致
运行路径: ${__dirname}`;
loggerUtils.logToFile(new LogData(envInfo, 'log'));


// 必须定义在 main.ts 中否则会报错，未连接，todo 时机问题？
export const writeDbConfig: DataSourceOptions = {
  type: 'better-sqlite3',
  database: resolve(process.cwd(), 'db/application.db'),
  entities: [...SystemEntityList],
  synchronize: true,
  name: WRITE_CONNECTION_NAME,
};

export const readDbConfig: DataSourceOptions = {
  type: 'better-sqlite3',
  database: resolve(process.cwd(), 'db/application.db'),
  entities: [...SystemEntityList],
  synchronize: true,
  name: READ_CONNECTION_NAME,
};
loggerUtils.logToFile(new LogData(`数据库配置信息:
writeDb path: ${writeDbConfig.database}
readDb path: ${readDbConfig.database}`, 'log'));


export async function setupConnections() {
  try {
    // 连接从数据库
    await createConnection(writeDbConfig);
    await createConnection(readDbConfig);
    loggerUtils.logToFile(new LogData('数据库连接成功', 'log'));
  } catch (error) {
    loggerUtils.logToFile(new LogData(`数据库连接失败: ${error.message}`, 'error', error.stack));
    throw error;
  }
}

async function bootstrap() {
  loggerUtils.logToFile(new LogData('服务启动中...', 'log'));
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  loggerUtils.logToFile(new LogData('全局拦截器和异常过滤器已配置', 'log'));
  process.on('unhandledRejection', function (err:any) {
    loggerUtils.logToFile(new LogData(`未处理的 Promise 拒绝: ${err.message}`, 'error', err.stack));
  });
  process.on('uncaughtException', function (e) {
    loggerUtils.logToFile(new LogData(`未捕获的异常: ${e.message}`, 'error', e.stack));
  });
  setupConnections();
  loggerUtils.logToFile(new LogData(`配置的端口: ${process.env.PORT || 8003}`, 'log'));
  const port = process.env.PORT ?? 8003;
  await app.listen(port);
  loggerUtils.logToFile(new LogData(`服务已启动，监听端口: ${port}`, 'log'));
}
bootstrap();
