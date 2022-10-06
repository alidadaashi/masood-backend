import { NextFunction, Request, Response } from "express";
import knex from "../../../base/database/cfgKnex";
import SrUserPagePreference from "./srUserPagePreference";
import { utGetUserSession } from "../../shared/utils/utOther";
import { MESSAGE_PAGE_PREF_NOT_EXISTS, MESSAGE_PAGE_PREF_UPDATED } from "../../shared/constants/dtOtherConstants";

class CtUserPagePreference {
  static async getPagePreference(
    req: Request<{pageKey: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const data = await SrUserPagePreference.getPagePreferenceByPageKey(trx, session.uEntityId, req.params.pageKey);
        if (data) res.sendObject(data);
        else res.sendMsg(MESSAGE_PAGE_PREF_NOT_EXISTS);
      });
    } catch (e) {
      next(e);
    }
  }

  static async updatePagePreference(
    req: Request<{id: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        await SrUserPagePreference.updatePagePreference(trx, req.params.id, req.body);
        res.sendMsg(MESSAGE_PAGE_PREF_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtUserPagePreference;
