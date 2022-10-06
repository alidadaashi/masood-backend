import { NextFunction, Request, Response } from "express";
import { utGetUserSession } from "../../shared/utils/utOther";
import knex from "../../../base/database/cfgKnex";
import SrUserSelectedInstance from "./srUserSelectedInstance";
import { MESSAGE_DEFAULT_INSTANCE_SELECTED } from "../../shared/constants/dtOtherConstants";
import SrSession from "../../shared/services/srSession";
import { tpUserInstances, UserSessionType } from "../../shared/types/tpShared";
import DoEntityUser from "../../entity/entityUser/doEntityUser";

class CtUserSelectedInstance {
  static async getUserSelectedInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const selectedInstance = await SrUserSelectedInstance.getUserSelectedInstance(trx, session.uEntityId);
        res.sendObject(selectedInstance);
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateUserSelectedInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      const { selectedInstances } = req.body;
      await knex.transaction(async (trx) => {
        const verifyInstanceUserRel = await Promise.all(selectedInstances.map(async (instance: tpUserInstances) => {
          await DoEntityUser.findOneByPredicate(trx, {
            euEntityId: instance.gEntityId,
            euUserEntityId: session.uEntityId,
          });
        }));
        if (verifyInstanceUserRel) {
          SrSession.saveSession(req, {
            ...session, userInstances: selectedInstances,
          } as UserSessionType);
          res.sendMsg(MESSAGE_DEFAULT_INSTANCE_SELECTED);
        }
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtUserSelectedInstance;
