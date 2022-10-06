import path from "path";
import { AppEnv } from "../loaders/cfgBaseLoader";

const cfgApp = {
  assetsPath: path.join((process.env as { NODE_PATH: string }).NODE_PATH, "public", "assets"),
  defaultDbRowsReturnLimit: AppEnv.defaultSettings.defaultDbRowsReturnLimit,
  appUniversalMomentDateFormat: "DD/MM/YYYY",
  minimumPasswordLength: 6,
};

export default cfgApp;
