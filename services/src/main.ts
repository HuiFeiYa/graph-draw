import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptionFilter/AllExceptionsFilter';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { createConnection, DataSourceOptions } from 'typeorm';


const secondaryDbConfig: DataSourceOptions = {
  type: 'sqlite',
  database: 'db/mdesign.db',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
  name: 'secondary',
};

async function setupConnections() {
  try {
    // 连接从数据库
    await createConnection(secondaryDbConfig);
    console.log('Connected to secondary database');
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
