import DoBase from "../../base/dao/doBase";
import MdAppNotifications from "./mdAppNotifications";

class DoAppNotifications extends DoBase<MdAppNotifications> {
  constructor() {
    super(MdAppNotifications.TABLE_NAME);
  }
}

export default new DoAppNotifications();
