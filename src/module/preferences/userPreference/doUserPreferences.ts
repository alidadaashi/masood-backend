import DoBase from "../../../base/dao/doBase";
import MdUserPreferences from "./mdUserPreferences";

class DoUserPreferences extends DoBase<MdUserPreferences> {
  constructor() {
    super(MdUserPreferences.TABLE_NAME);
  }
}

export default new DoUserPreferences();
