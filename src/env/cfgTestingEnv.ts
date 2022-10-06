import CfgDevelopmentEnv from "./cfgDevelopmentEnv";

abstract class CfgTestingEnv extends CfgDevelopmentEnv {
  static oldItg = {
    host: "127.0.0.1",
    username: "root",
    password: "pass",
    dbName: "vedi",
  }

  static defaultSettings = {
    defaultDbRowsReturnLimit: 1000,
  }
}

export default CfgTestingEnv;
