import 'reflect-metadata';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptionFilter/AllExceptionsFilter';
import { createConnection, DataSourceOptions } from 'typeorm';
import { LogLevel } from "@nestjs/common";
import {
  READ_CONNECTION_NAME,
  WRITE_CONNECTION_NAME,
} from './utils/transaction';
import { SystemEntityList } from './entities';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggingInterceptor } from './interceptors/LoggingInterceptor';
import { loggerUtils } from './utils/LoggerUtils';
import { LogData } from './types/common';

// 必须定义在 main.ts 中否则会报错，未连接，todo 时机问题？
export const writeDbConfig: DataSourceOptions = {
  type: 'better-sqlite3',
  database: 'db/application.db',
  entities: [...SystemEntityList],
  synchronize: true,
  name: WRITE_CONNECTION_NAME,
};
export const readDbConfig: DataSourceOptions = {
  type: 'better-sqlite3',
  database: 'db/application.db',
  entities: [...SystemEntityList],
  synchronize: true,
  name: READ_CONNECTION_NAME,
};

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
  const host = app.get(HttpAdapterHost);
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
