import { tpMailGunConfigOptions } from "../module/shared/types/tpEmail";

abstract class CfgDevelopmentEnv {
  static host = "127.0.0.1";
  static port = "4321";

  static webSocket = {
    port: 4322,
  };

  static allowedOrigins = [
    "http://127.0.0.1:5321",
    "http://localhost:5321",
    "http://192.168.10.22:5312",
  ];

  static defaultSettings = {
    defaultDbRowsReturnLimit: 10,
  }

  static oldDbVendorIdsToMigrate = [40000, 40999, 50000, 50007, 50162, 99992]

  static oldDbSyncIntervalInMinutes = 1

  static oldItg = {
    host: "212.58.4.78",
    username: "vitgusa",
    password: "new8754152",
    dbName: "vedi",
  }

  static knex = {
    client: "pg",
    connection: {
      host: "127.0.0.1",
      user: "itg",
      password: "itg",
      database: "itg3",
      charset: "utf8",
    },
    migrations: {
      directory: "src/base/database/knex/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "src/base/database/knex/seeds",
      extension: "ts",
    },
  };

  static session = {
    secret: "secret_code",
    cookieName: "_vsrm",
    expireInMin: 60,
    redis: {
      host: "localhost",
      port: 6379,
    },
  };

  static emailService = {
    mailGunDomain: (): string => "mail.vsrm.net",
    mailGunConfig: (): tpMailGunConfigOptions => ({
      client: {
        username: "api",
        key: "",
      },
      emailParams: {
        from: "support@vsrm.net",
        template: "",
      },
    }),
  }
}

export default CfgDevelopmentEnv;
