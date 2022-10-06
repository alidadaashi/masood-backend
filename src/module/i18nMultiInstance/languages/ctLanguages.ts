import { Transaction } from "knex";
import { NextFunction, Request, Response } from "express";
import knex from "../../../base/database/cfgKnex";
import SrLanguages from "./srLanguages";
import { utGetUserSession } from "../../shared/utils/utOther";
import SrUserSelectedInstance from "../../user/userSelectedInstance/srUserSelectedInstance";
import { MESSAGE_LANG_CREATED, MESSAGE_LANG_UPDATED } from "../../shared/constants/dtOtherConstants";

class CtLanguages {
  static async getAllLanguages(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const sessionUser = req.session?.user;
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const allLanguages = await SrLanguages.getAllLanguages(trx, sessionUser);
        res.sendList({ list: allLanguages, total: allLanguages.length });
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateLanguages(
    req: Request<{ selectedInstanceId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const selectedUserInstance = await SrUserSelectedInstance.getSelectedInstance(trx, sessionUser.uEntityId);
        await SrLanguages.updateLanguages(trx, sessionUser, req.body, selectedUserInstance?.usiSelectedInstanceEntityId);
        res.sendMsg(MESSAGE_LANG_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async addLanguage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        await SrLanguages.addLanguage(trx, req.body, sessionUser);
        res.sendMsg(MESSAGE_LANG_CREATED);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtLanguages;
