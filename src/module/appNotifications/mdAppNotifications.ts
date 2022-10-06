import MdBase from "../../base/models/mdBase";

class MdAppNotifications extends MdBase {
  static TABLE_NAME = "app_notifications";

  constructor(
    public anId: string,
    public anSenderId: string,
    public anReceiverId: string,
    public anTitle: string,
    public anDescription: string,
    public anMarkAsView: boolean,
    public anSeverity: string,
    public anCreatedAt?: string,
    public anUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdAppNotifications, prefix = true): string {
    return prefix ? `${MdAppNotifications.TABLE_NAME}.${k}` : k;
  }
}

export default MdAppNotifications;
