import CfgEnv, { APP_ENV } from "./cfgEnvLoader";

export const env: APP_ENV | string = process.env.NODE_ENV
  ? process.env.NODE_ENV
  : "development";
export const AppEnv = CfgEnv.getEnvConfig(env as APP_ENV);
export const cfgIsEnv = (nodeEnv: APP_ENV): boolean => process.env.NODE_ENV === nodeEnv;
