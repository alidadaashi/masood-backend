import Knex from "knex";
import { AppEnv } from "../../base/loaders/cfgBaseLoader";
import knex from "../../base/database/cfgKnex";

export const srGetOldDbConnection = ():Knex => Knex({
  client: "mysql",
  connection: {
    host: AppEnv.oldItg.host,
    user: AppEnv.oldItg.username,
    password: AppEnv.oldItg.password,
    database: AppEnv.oldItg.dbName,
    port: 3306,
    charset: "utf8",
  },
});

export const srGetNewDbConnection = ():Knex => knex;
