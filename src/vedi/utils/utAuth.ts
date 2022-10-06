import { Request, Response, NextFunction } from "express";
import redis from "redis";
import * as util from "util";
import { SessionData } from "express-session";
import { UNAUTHORIZED } from "http-status-codes";
import { newDbConnection } from "../module/dbSyncTests/srDbSynctests";
import doEntityUser from "../../module/entity/entityUser/doEntityUser";
import doUser from "../../module/user/doUser";
import { ctGetUserSessionData } from "../../module/auth/ctAuth";
import SrSession from "../../module/shared/services/srSession";
import { UserSessionType } from "../../module/shared/types/tpShared";

const utGetSessionFromRemoteRedisUsingKey = (oldVsrmSessionId: string): Promise<string | null> => {
  const redisClient = redis.createClient({
    host: "159.65.58.178",
  });
  const getAsync = util.promisify(redisClient.get).bind(redisClient);
  return getAsync(oldVsrmSessionId);
};

const utUnAuthorized = (res: Response) => {
  res.status(UNAUTHORIZED).json({ message: "Authentication Denied" });
};

export const utMakeSessionByOldDbUser = async (
  refId: string, userOrgType: "vendor" | "supplier", req: Request,
): Promise<SessionData["user"] | undefined> => {
  let sessionData: SessionData["user"] | undefined;
  await newDbConnection.transaction(async (trx) => {
    const entityUser = await doEntityUser.findOneByCol(trx, "refId", refId);
    const user = await doUser.findOneByCol(trx, "uEntityId", entityUser.euUserEntityId);
    sessionData = await ctGetUserSessionData(trx, req.session.id, user);
    sessionData.userType = userOrgType;
  });
  return sessionData;
};

const utGetSessionFromOldVsrmSession = async (oldVsrmSessionId: string, res: Response):
  Promise<{ session: string, supplierSession: string }> => {
  const session = await utGetSessionFromRemoteRedisUsingKey(`sess:${oldVsrmSessionId}`);
  const supplierSession = await utGetSessionFromRemoteRedisUsingKey(`supplierSession:${oldVsrmSessionId}`);
  if (!session && !supplierSession) utUnAuthorized(res);
  return {
    session: session || "",
    supplierSession: supplierSession || "",
  };
};

const utSaveSessionInReq = (req: Request, sessionData: UserSessionType | undefined,
  parsedSessionData: SessionData["oldDbUser"]) => {
  SrSession.saveSession(req, sessionData as UserSessionType);
  req.session.oldDbUser = parsedSessionData;
};

const utIsAuthOldAppMW = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.cookies.JSESSIONID) return utUnAuthorized(res);

  const { session, supplierSession } = await utGetSessionFromOldVsrmSession(req.cookies.JSESSIONID, res);

  const parsedSessionData: SessionData["oldDbUser"] = JSON.parse(session || supplierSession);
  if (!parsedSessionData.vendorId && !parsedSessionData.supplierId) return utUnAuthorized(res);

  const userId = parsedSessionData.vendorUserId ? parsedSessionData.vendorUserId : parsedSessionData.supplierUserId;
  const userOrgType = parsedSessionData.supplierUserId ? "supplier" : "vendor";
  if (!userId) return utUnAuthorized(res);
  const sessionData = await utMakeSessionByOldDbUser(userId.toString(), userOrgType, req);

  utSaveSessionInReq(req, sessionData, parsedSessionData);

  return next();
};

export default utIsAuthOldAppMW;
