import { TypeOrmModuleOptions } from "@nestjs/typeorm";

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
    entities: [],
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