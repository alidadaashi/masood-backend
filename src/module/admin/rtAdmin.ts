import express from "express";
import CtMiscellaneousSettings from "./miscellaneousSettings/ctMiscellaneousSettings";

const adminRouter = express.Router();

adminRouter.put("/misc-settings/", CtMiscellaneousSettings.updateMiscellaneousSettings);
adminRouter.get("/misc-settings/", CtMiscellaneousSettings.getMiscellaneousSettings);
adminRouter.get("/misc-settings/:settingsKey", CtMiscellaneousSettings.getMiscellaneousSettingsByType);

export default adminRouter;
