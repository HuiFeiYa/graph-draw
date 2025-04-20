import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { SystemEntityList } from "src/entities";
import { READ_CONNECTION_NAME, WRITE_CONNECTION_NAME } from "src/utils/transaction";

const baseConfig = {
    "type": "better-sqlite3",
    "entities": [],
    "synchronize": false,
    "charset":"UTF8_GENERAL_CS",
    "database":"./db/mdesign.db"
}
export const dbConfig: TypeOrmModuleOptions = {
    ...baseConfig,
    // port: MYSQL_PORT,
    type: 'better-sqlite3',
    entities: [...SystemEntityList],
    // charset: "",
    // debug: false,
    logging: [
      // "query",
      "migration",
      "error",
      "warn"
    ],
    // multipleStatements: true,
    synchronize: process.env.AppEnv === 'dev', //

  
    // prepareDatabase: (db) => {
    //   console.log(db);
    // }
  
  };


  // sqlite一个连接同时只能进行一个事务，所以建立了多个连接进行读并发事务，只有一个连接负责写
export const connectionNames = ['default', READ_CONNECTION_NAME, WRITE_CONNECTION_NAME];