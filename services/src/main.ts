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
import *  as  sqlite3 from 'better-sqlite3'
// 打印 Node.js 版本和 ABI 版本（关键！）
console.log(`
[Node 服务环境检查]
Node.js 版本: ${process.version}
NODE_MODULE_VERSION: ${process.versions.modules}  <-- 必须与 Electron 的 130 一致
运行路径: ${__dirname}
`);


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
console.log('writeDb path:', writeDbConfig.database) 
console.log('readDb path:', readDbConfig.database)


export async function setupConnections() {
  try {
    // 连接从数据库
    await createConnection(writeDbConfig);
    await createConnection(readDbConfig);
    console.log('Connected to writeDbConfig database');
  } catch (error) {
    console.error('Error connecting to databases:', error);
    throw error;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  process.on('unhandledRejection', function (err:any) {
    console.error('打印 unhandledRejection:', err);
    loggerUtils.logToFile(new LogData(err.message, 'error'));
  });
  process.on('uncaughtException', function (e) {
    console.log('打印 uncaughtException', e);
    loggerUtils.logToFile(new LogData(e.message + e.stack, 'error'));
  });
  setupConnections();
  console.log('process.env.PORT:', process.env.PORT);
  await app.listen(process.env.PORT ?? 8003);
}
bootstrap();
