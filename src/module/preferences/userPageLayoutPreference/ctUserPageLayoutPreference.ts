import { NextFunction, Request, Response } from "express";
import SrUserPageLayoutPreference from "./srUserPageLayoutPreference";
import { utGetUserSession } from "../../shared/utils/utOther";
import knex from "../../../base/database/cfgKnex";
import { MESSAGE_LAYOUT_PREFERENCE_SAVED, MESSAGE_LAYOUT_PREF_DELETED, MESSAGE_LAYOUT_PREF_UPDATED } from "../../shared/constants/dtOtherConstants";

class CtUserPageLayoutPreference {
  static async addPageLayoutPreference(
    req: Request<{pageKey: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        const data = await SrUserPageLayoutPreference
          .addLayoutPreference(trx, session.uEntityId, req.params.pageKey, req.body);
        res.sendObject(data, MESSAGE_LAYOUT_PREFERENCE_SAVED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getPageLayoutPreferences(
    req: Request<{pageKey: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const data = await SrUserPageLayoutPreference.getLayoutPreferences(trx, session.uEntityId, req.params.pageKey);
        res.sendList({ list: data, total: data.length });
      });
    } catch (e) {
      next(e);
    }
  }

  static async getPageLayoutPreferenceDetails(
    req: Request<{id: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const data = await SrUserPageLayoutPreference.getLayoutPreferenceDetails(trx, req.params.id);
        res.sendObject(data);
      });
    } catch (e) {
      next(e);
    }
  }

  static async updatePageLayoutPreference(
    req: Request<{id: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        await SrUserPageLayoutPreference.updateLayoutPreference(trx, req.params.id, req.body);
        res.sendMsg(MESSAGE_LAYOUT_PREF_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async deletePageLayoutPreference(
    req: Request<{id: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        await SrUserPageLayoutPreference.deleteLayoutPreference(trx, req.params.id);
        res.sendMsg(MESSAGE_LAYOUT_PREF_DELETED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getFavoritePageLayoutPreferenceDetails(
    req: Request<{pageKey: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const data = await SrUserPageLayoutPreference
          .getFavoritePageLayoutPreferenceDetails(trx, session.uEntityId, req.params.pageKey);
        if (data) res.sendObject(data);
        else res.sendObject({});
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtUserPageLayoutPreference;
