import { NextFunction, Request, Response } from "express";
import knex from "../../../base/database/cfgKnex";
import { MESSAGE_SETTINGS_APPLIED } from "../../shared/constants/dtOtherConstants";
import { MiscellaneousSettingsKeyType } from "../../shared/types/tpShared";
import { utGetUserSession } from "../../shared/utils/utOther";
import SrMiscellaneousSettings from "./srMiscellaneousSettings";

class CtMiscellaneousSettings {
  static async updateMiscellaneousSettings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        await SrMiscellaneousSettings
          .updateMiscellaneousSettingsByType(trx, session.uEntityId, req.body);
        res.sendMsg(MESSAGE_SETTINGS_APPLIED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getMiscellaneousSettings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const response = await SrMiscellaneousSettings.getMiscellaneousSettings(trx);
        res.sendObject(response);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getMiscellaneousSettingsByType(
    req: Request<{ settingsKey: MiscellaneousSettingsKeyType }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const response = await SrMiscellaneousSettings
          .getMiscellaneousSettingsByType(trx, req.params.settingsKey);
        res.sendObject(response);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtMiscellaneousSettings;
