import { Transaction } from "knex";
import SrRedis from "../services/srRedis";
import SrWebSocket from "../services/srWebSocket";
import { WS_SESSION_TYPE } from "../constants/dtOtherConstants";
import SrPrivileges from "../../privilege/srPrivileges";
import { UserSessionType } from "../types/tpShared";
import { ITG_ADMIN_USER_ID } from "../constants/dtPrivilegeIdsConstants";
import { stdLog } from "./utLog";

const { redisClient } = SrRedis.get();

export const utBroadcastTranslateUpdateNotificationToAll = ():void => {
  SrWebSocket.get().broadCastDataToAllClients(null, "TRANSLATIONS");
};

export const utUpdateUserPrivilegesInSession = async (
  userEntityId: string,
  getNewData: (oldData: { user: UserSessionType }) => { user: UserSessionType },
): Promise<boolean> => {
  const userSessionData = await SrRedis.getSessionByValue(
    (v: { user: UserSessionType }) => v.user?.uEntityId === userEntityId,
  );
  if (userSessionData?.key) {
    const newSData = getNewData(userSessionData.value);
    try {
      await new Promise<void>((res, rej) => {
        redisClient.set(userSessionData.key, JSON.stringify(newSData), (err) => (err
          ? rej(err)
          : res()));
      });

      SrWebSocket.get()
        .broadCastDataToClient(userSessionData.key, newSData.user, WS_SESSION_TYPE);
    } catch (e) {
      stdLog("Redis session error \"utUpdateUserPrivilegesInSession\"", e as string);
      return false;
    }
  }

  return !!userSessionData;
};

export const utUpdateAllUsersPrivilegesIn = async (trx: Transaction, userEntityIds: string[]): Promise<void> => {
  const awaitMe = userEntityIds.map(async (userEntityId) => {
    const matchedUser = await SrRedis
      .getSessionByValue((sv: { user: UserSessionType }) => (sv.user?.uEntityId === userEntityId));
    if (matchedUser?.key) {
      const newPrivilegesData = await SrPrivileges.getUserAllPrivileges(trx, userEntityId);
      await utUpdateUserPrivilegesInSession(userEntityId, (
        oldData = {} as { user: UserSessionType },
      ) => ({
        ...oldData,
        user: {
          ...(oldData.user || {}),
          privileges: newPrivilegesData,
        },
      }));
    }
  });

  await Promise.all(awaitMe);
};

export const utIsItgAdminUser = (user?: UserSessionType):boolean => user?.uId === ITG_ADMIN_USER_ID;
