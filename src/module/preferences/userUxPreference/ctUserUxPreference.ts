import { NextFunction, Request, Response } from "express";
import { utGetUserSession } from "../../shared/utils/utOther";
import knex from "../../../base/database/cfgKnex";
import SrUserUxPreference from "./srUserUxPreference";
import { MESSAGE_PREFERENCE_SAVED } from "../../shared/constants/dtOtherConstants";
import { UxPreferencesKeyType } from "../../shared/types/tpShared";

class CtUserUxPreference {
  static async updateUserUxPreference(
    req: Request<{ preferenceKey: UxPreferencesKeyType }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        await SrUserUxPreference
          .updateUserUxPreference(trx, session.uEntityId, req.params.preferenceKey, req.body);
        res.sendMsg(MESSAGE_PREFERENCE_SAVED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getUserUxPreferences(
    req: Request<{ preferenceKey: UxPreferencesKeyType }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        const response = await SrUserUxPreference.getUserUxPreferences(trx, session.uEntityId);
        res.sendObject(response);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getUserUxPreferenceByType(
    req: Request<{ preferenceKey: UxPreferencesKeyType }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        const response = await SrUserUxPreference
          .getUserUxPreferenceByType(trx, session.uEntityId, req.params.preferenceKey);
        res.sendObject(response);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtUserUxPreference;
