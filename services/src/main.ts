import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptionFilter/AllExceptionsFilter';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { createConnection, DataSourceOptions } from 'typeorm';
import { READ_CONNECTION_NAME, WRITE_CONNECTION_NAME } from './utils/transaction';
import { SystemEntityList } from './entities';

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
  const app = await NestFactory.create(AppModule, {cors: true});
  app.useGlobalFilters(new AllExceptionsFilter());
  setupConnections();
  console.log('process.env.PORT:',process.env.PORT)
  await app.listen(process.env.PORT ?? 8003);
}
bootstrap();
