import { MAIN_DATA_SOURCE_NAME } from 'src/constants';
import { ApplicationProject } from 'src/entities/applicationProject.entity';
import { DataSource } from 'typeorm';

export const MainDataSource = new DataSource({
    name: MAIN_DATA_SOURCE_NAME,
    type: 'better-sqlite3',
    // database: './main-db.sqlite', // 主数据库文件路径
    database: '../db/project_190ce3yr-s9-a.db', // 主数据库文件路径
    entities: [ApplicationProject], // 主数据库实体
    synchronize: true, // 开发环境中开启同步表结构，生产环境应关闭
    logging: false,
});