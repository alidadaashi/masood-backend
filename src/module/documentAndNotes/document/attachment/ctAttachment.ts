import { Request, Response, NextFunction } from "express";
import { MSG_ATTACHMENT_ADDED_SUCCESSFULLY } from "../../../shared/constants/dtOtherConstants";
import knex from "../../../../base/database/cfgKnex";
import SrAttachment from "./srAttachment";
import { utGetUserSession } from "../../../shared/utils/utOther";

class CtAttachment {
  static async addAttachment(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const createdAttachment = await SrAttachment.addAttachment(
          trx,
          req.body,
          sessionUser.uEntityId,
        );
        res.sendObject(createdAttachment, MSG_ATTACHMENT_ADDED_SUCCESSFULLY);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtAttachment;
