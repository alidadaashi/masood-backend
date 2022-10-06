import { Request, Response, NextFunction } from "express";
import knex from "../../base/database/cfgKnex";
import { utGetUserSession } from "../shared/utils/utOther";
import SrUserSelectedInstance from "../user/userSelectedInstance/srUserSelectedInstance";
import doAppNotifications from "./doAppNotifications";

class CtAppNotifications {
  static async getAllUnReadNotifications(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, session.uEntityId) || {};
        if (usiSelectedInstanceEntityId) {
          const notifications = await doAppNotifications
            .findAllByPredicate(trx, { anReceiverId: session.uEntityId, anMarkAsView: false });
          res.sendList({ list: notifications });
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllNotifications(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, session.uEntityId) || {};
        if (usiSelectedInstanceEntityId) {
          const notifications = await doAppNotifications
            .findAllByPredicate(trx, { anReceiverId: session.uEntityId });
          res.sendList({ list: notifications });
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async clearAllNotifications(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, session.uEntityId) || {};
        if (usiSelectedInstanceEntityId) {
          await doAppNotifications
            .updateOneByColName(trx, { anMarkAsView: true }, "anReceiverId", session.uEntityId);
        }
        res.sendMsg("success");
      });
    } catch (e) {
      next(e);
    }
  }

  static async markNotificationsAsViewed(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, session.uEntityId) || {};
        if (usiSelectedInstanceEntityId) {
          await Promise.all(req.body.ids.map(async (anId: string) => {
            await doAppNotifications.updateOneByColName(trx, { anMarkAsView: true }, "anId", anId);
          }));
        }
        res.sendMsg("success");
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtAppNotifications;
