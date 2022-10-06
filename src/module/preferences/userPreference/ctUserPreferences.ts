import { NextFunction, Request, Response } from "express";
import { utGetUserSession } from "../../shared/utils/utOther";
import knex from "../../../base/database/cfgKnex";
import { UserPreferencesKeyType } from "../../shared/types/tpShared";
import { MESSAGE_PREFERENCE_SAVED } from "../../shared/constants/dtOtherConstants";
import SrUserPreferences from "./srUserPreferences";

class CtUserPreferences {
  static async updateUserPreferences(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        await SrUserPreferences.updateUserPreferences(trx, session.uEntityId, req.body);
        res.sendMsg(MESSAGE_PREFERENCE_SAVED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getUserPreferences(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        const response = await SrUserPreferences.getUserPreferences(trx, session.uEntityId);
        res.sendObject(response);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getUserPreferenceByType(
    req: Request<{ preferenceKey: UserPreferencesKeyType }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        const response = await SrUserPreferences.getUserPreferenceByType(trx, session.uEntityId, req.params.preferenceKey);
        res.sendObject(response);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtUserPreferences;
