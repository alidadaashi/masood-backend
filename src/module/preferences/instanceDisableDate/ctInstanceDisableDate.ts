import { Request, Response, NextFunction } from "express";
import knex from "../../../base/database/cfgKnex";
import SrInstanceDisableDates from "./srInstanceDisableDate";
import { utGetUserSession } from "../../shared/utils/utOther";
import { MESSAGE_DEFAULT_INSTANCE_SETTINGS_UPDATED } from "../../shared/constants/dtOtherConstants";
import { utIsItgAdmin } from "../../shared/utils/utAuth";

class CtInstanceDisableDates {
  static async updateInstanceDisableDates(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        if (!utIsItgAdmin(session)) {
          const selectedInstances = session.userInstances;
          await SrInstanceDisableDates.updateInstanceDisableDates(trx, selectedInstances, req.body);
          res.sendMsg(MESSAGE_DEFAULT_INSTANCE_SETTINGS_UPDATED);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async getInstanceDisableDates(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        if (!utIsItgAdmin(session)) {
          const selectedInstances = session.userInstances;
          const response = await SrInstanceDisableDates.getInstanceDisableDates(trx, selectedInstances);
          res.sendObject(response);
        }
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtInstanceDisableDates;
