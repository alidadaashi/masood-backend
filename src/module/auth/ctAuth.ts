import { NextFunction, Request, Response } from "express";
import { Transaction } from "knex";
import knex from "../../base/database/cfgKnex";
import DoCredential from "../user/credentials/doCredential";
import MdUnprocessableEntityError from "../../base/errors/mdUnprocessableEntityError";
import SrPrivileges from "../privilege/srPrivileges";
import DoUser from "../user/doUser";
import DoFile from "../shared/module/files/doFile";
import { ERR_USER_NOT_EXISTS, MESSAGE_INVALID_DATA } from "../shared/constants/dtOtherConstants";
import SrSession from "../shared/services/srSession";
import SrWebSocket from "../shared/services/srWebSocket";
import { UserSessionType } from "../shared/types/tpShared";
import MdUser from "../user/mdUser";
import { srCheckCredentials } from "./srAuth";
import SrUser from "../user/srUser";
import { ITG_ADMIN_USER_ID } from "../shared/constants/dtPrivilegeIdsConstants";

export const ctGetUserSessionData = async (trx: Transaction, sessionId: string, user: MdUser): Promise<UserSessionType> => {
  const userPermissions = await SrPrivileges.getUserAllPrivileges(trx, user.uEntityId);
  const userProfilePicture = user
    ? await DoFile.findOneByPredicate(trx, {
      fEntityId: user.uEntityId,
      fType: "image",
    }, ["fPath", "fId"])
    : {};

  const isItgAdmin = user.uId === ITG_ADMIN_USER_ID;
  const initialSelectedInstance = (await SrUser.getUserInstances(trx, user.uEntityId, false))[0];

  const sessionData = {
    ...(user || {}),
    ...(userProfilePicture || {}),
    privileges: userPermissions,
    sid: sessionId,
  };

  const userSession = (isItgAdmin || !initialSelectedInstance)
    ? sessionData : { ...sessionData, userInstances: [initialSelectedInstance] || [] };

  return userSession as unknown as UserSessionType;
};

class CtAuth {
  static async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        email,
        password,
      } = req.body;
      if (email && password) {
        await knex.transaction(async (trx) => {
          const credentials = await DoCredential.findOneByCol(trx, "cEmail", email);
          if (await srCheckCredentials(credentials, password, trx)) {
            const user = await DoUser.findOneByCol(trx, "uEntityId", credentials.cUserEntityId);
            const sessionData = await ctGetUserSessionData(trx, req.session.id, user);
            SrSession.saveSession(req, sessionData as UserSessionType);
            res.sendObject(sessionData);
          } else {
            res.status(401)
              .send({ message: ERR_USER_NOT_EXISTS });
          }
        });
      } else {
        throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
      }
    } catch (e) {
      next(e);
    }
  }

  static async getSession(
    req: Request,
    res: Response,
  ): Promise<void> {
    res.sendObject(req.session.user as UserSessionType);
  }

  static async logout(
    req: Request,
    res: Response,
  ): Promise<void> {
    if (req.session) {
      const sessionId = req.session.id;
      SrSession.destroySession(req);
      SrWebSocket.get()
        .destroyClientConnection(sessionId);
    }
    res.end("The session has been destroyed");
  }
}

export default CtAuth;
