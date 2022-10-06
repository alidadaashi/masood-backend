import CfgTestingEnv from "../../env/cfgTestingEnv";
import DevelopmentConfig from "../../env/cfgDevelopmentEnv";
import ProductionConfig from "../../env/cfgProductionEnv";

export type APP_ENV = "development" | "production" | "testing";

class CfgEnv {
  static getEnvConfig(env: APP_ENV): typeof DevelopmentConfig {
    if (env === "production") return ProductionConfig;
    if (env === "testing") return CfgTestingEnv;
    return DevelopmentConfig;
  }
}

export default CfgEnv;
