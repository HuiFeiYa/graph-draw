import { SystemEntityList } from 'src/entities';
import { DataSource } from 'typeorm';
import { resolve } from 'path';
const databasePath = resolve(process.cwd(), 'db/hfdraw.db');
console.log('__dirname:',__dirname)
console.log('databasePath:',databasePath)
export const MainDataSource = new DataSource({
    type: 'better-sqlite3',
    // database: './main-db.sqlite', // 主数据库文件路径
    database: databasePath, // 主数据库文件路径
    entities: SystemEntityList, // 主数据库实体
    synchronize: true, // 开发环境中开启同步表结构，生产环境应关闭
    logging: false,
});
