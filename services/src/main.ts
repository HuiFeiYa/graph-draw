import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptionFilter/AllExceptionsFilter';
import { createConnection, DataSourceOptions } from 'typeorm';
import { resolve, dirname } from 'path';
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
NODE_MODULE_VERSION: ${process.versions.modules} 
运行路径: ${__dirname}
进程ID: ${process.pid}
当前工作目录: ${process.cwd()}
__filename: ${__filename}`;
loggerUtils.logToFile(new LogData(envInfo, 'log'));

// 使用运行路径来确定数据库路径，而不是工作目录
const dbDir = resolve(dirname(__dirname), 'db');
const dbPath = resolve(dbDir, 'application.db');

loggerUtils.logToFile(new LogData(`数据库路径计算:
dbDir: ${dbDir}
dbPath: ${dbPath}
__dirname: ${__dirname}
dirname(__dirname): ${dirname(__dirname)}`, 'log'));

// 必须定义在 main.ts 中否则会报错，未连接，todo 时机问题？
export const writeDbConfig: DataSourceOptions = {
  type: 'better-sqlite3',
  database: dbPath,
  entities: [...SystemEntityList],
  synchronize: true,
  name: WRITE_CONNECTION_NAME,
};

export const readDbConfig: DataSourceOptions = {
  type: 'better-sqlite3',
  database: dbPath,
  entities: [...SystemEntityList],
  synchronize: true,
  name: READ_CONNECTION_NAME,
};

loggerUtils.logToFile(new LogData(`数据库配置信息:
writeDb path: ${writeDbConfig.database}
readDb path: ${readDbConfig.database}
实体列表: ${SystemEntityList.map(entity => entity.name).join(', ')}`, 'log'));

export async function setupConnections() {
  try {
    loggerUtils.logToFile(new LogData('开始建立数据库连接...', 'log'));
    
    // 连接从数据库
    loggerUtils.logToFile(new LogData('正在连接写数据库...', 'log'));
    await createConnection(writeDbConfig);
    loggerUtils.logToFile(new LogData('写数据库连接成功', 'log'));
    
    loggerUtils.logToFile(new LogData('正在连接读数据库...', 'log'));
    await createConnection(readDbConfig);
    loggerUtils.logToFile(new LogData('读数据库连接成功', 'log'));
    
    loggerUtils.logToFile(new LogData('所有数据库连接建立完成', 'log'));
  } catch (error) {
    loggerUtils.logToFile(new LogData(`数据库连接失败: ${error.message}`, 'error'));
    throw error;
  }
}

async function bootstrap() {
  try {
    loggerUtils.logToFile(new LogData('=== 服务启动开始 ===', 'log'));
    await setupConnections();
    loggerUtils.logToFile(new LogData('正在创建 NestJS 应用实例...', 'log'));
    const app = await NestFactory.create(AppModule, { 
      cors: true,
      logger: ['error', 'warn', 'log'] // 启用 NestJS 内置日志
    });
    loggerUtils.logToFile(new LogData('NestJS 应用实例创建成功', 'log'));
    
    loggerUtils.logToFile(new LogData('正在配置全局拦截器...', 'log'));
    app.useGlobalInterceptors(new LoggingInterceptor());
    loggerUtils.logToFile(new LogData('全局拦截器配置完成', 'log'));
    
    loggerUtils.logToFile(new LogData('正在配置全局异常过滤器...', 'log'));
    app.useGlobalFilters(new AllExceptionsFilter());
    loggerUtils.logToFile(new LogData('全局异常过滤器配置完成', 'log'));
    
    loggerUtils.logToFile(new LogData('正在配置进程异常处理...', 'log'));
    process.on('unhandledRejection', function (err:any) {
      loggerUtils.logToFile(new LogData(`未处理的 Promise 拒绝: ${err.message}`, 'error'));
    });
    process.on('uncaughtException', function (e) {
      loggerUtils.logToFile(new LogData(`未捕获的异常: ${e.message}`, 'error'));
    });
    loggerUtils.logToFile(new LogData('进程异常处理配置完成', 'log'));
    
    loggerUtils.logToFile(new LogData('正在建立数据库连接...', 'log'));
    loggerUtils.logToFile(new LogData('数据库连接建立完成', 'log'));
    
    const port = process.env.PORT ?? 8003;
    loggerUtils.logToFile(new LogData(`配置的端口: ${port}`, 'log'));
    
    loggerUtils.logToFile(new LogData('正在启动 HTTP 服务器...', 'log'));
    await app.listen(port);
    loggerUtils.logToFile(new LogData(`=== 服务启动成功，监听端口: ${port} ===`, 'log'));
    
  } catch (error) {
    loggerUtils.logToFile(new LogData(`服务启动失败: ${error.message}`, 'error'));
    throw error;
  }
}

// 添加启动过程的错误处理
bootstrap().catch(error => {
  loggerUtils.logToFile(new LogData(`Bootstrap 过程失败: ${error.message}`, 'error'));
  console.error('Bootstrap 过程失败:', error);
  process.exit(1);
});
