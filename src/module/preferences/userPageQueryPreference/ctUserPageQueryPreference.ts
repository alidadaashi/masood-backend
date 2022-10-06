import { NextFunction, Request, Response } from "express";
import { utGetUserSession } from "../../shared/utils/utOther";
import SrUserPageQueryPreference from "./srUserPageQueryPreference";
import knex from "../../../base/database/cfgKnex";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import {
  ERR_PREFERENCE_DETAILS_NOT_EXISTS, MESSAGE_PAGE_PREF_DELETED, MESSAGE_PAGE_PREF_UPDATED, MESSAGE_PREFERENCE_SAVED,
} from "../../shared/constants/dtOtherConstants";

class CtUserPageQueryPreference {
  static async addPageQueryPreference(
    req: Request<{pageKey: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const data = await SrUserPageQueryPreference
          .addQueryPreference(trx, session.uEntityId, req.params.pageKey, req.body);
        res.sendObject(data, MESSAGE_PREFERENCE_SAVED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getPageQueryPreferences(
    req: Request<{pageKey: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const data = await SrUserPageQueryPreference.getQueryPreferences(trx, session.uEntityId, req.params.pageKey);
        res.sendList({ list: data, total: data.length });
      });
    } catch (e) {
      next(e);
    }
  }

  static async getPageQueryPreferenceDetails(
    req: Request<{id: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const data = await SrUserPageQueryPreference.getQueryPreferenceDetails(trx, req.params.id);
        if (data) res.sendObject(data);
        else throw new MdUnprocessableEntityError(ERR_PREFERENCE_DETAILS_NOT_EXISTS);
      });
    } catch (e) {
      next(e);
    }
  }

  static async updatePageQueryPreference(
    req: Request<{id: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        await SrUserPageQueryPreference.updateQueryPreference(trx, session.uEntityId, req.params.id, req.body);
        res.sendMsg(MESSAGE_PAGE_PREF_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async deletePageQueryPreference(
    req: Request<{id: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        await SrUserPageQueryPreference.deleteQueryPreference(trx, req.params.id);
        res.sendMsg(MESSAGE_PAGE_PREF_DELETED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getFavoritePageQueryPreferenceDetails(
    req: Request<{pageKey: string}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const data = await SrUserPageQueryPreference
          .getFavoritePageQueryPreferenceDetails(trx, session.uEntityId, req.params.pageKey);
        if (data) res.sendObject(data);
        else res.sendObject({});
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtUserPageQueryPreference;
