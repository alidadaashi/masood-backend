import { WS_NOTIFICATION_TYPE } from "../shared/constants/dtOtherConstants";
import SrRedis from "../shared/services/srRedis";
import SrWebSocket from "../shared/services/srWebSocket";
import { UserSessionType } from "../shared/types/tpShared";

export const srSendNotificationHook = async (uEntityId: string): Promise<void> => {
  const userSessionData = await SrRedis.getSessionByValue(
    (v: { user: UserSessionType; }) => v.user?.uEntityId === uEntityId,
  );

  if (userSessionData?.key) {
    SrWebSocket.get()
      .broadCastDataToClient(userSessionData.key, "new notification added", WS_NOTIFICATION_TYPE);
  }
};

export const other = "";
