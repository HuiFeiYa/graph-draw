import { PROJECT_DATA_SOURCE_NAME } from 'src/constants';
import { Project } from 'src/entities/project.entity';
import { DataSource } from 'typeorm';

export const ProjectDataSource = new DataSource({
    name: PROJECT_DATA_SOURCE_NAME,
    type: 'better-sqlite3',
    database: './project-db.sqlite', // 项目数据库文件路径
    entities: [Project], // 项目数据库实体
    synchronize: true, // 开发环境中开启同步表结构，生产环境应关闭
    logging: false,
});