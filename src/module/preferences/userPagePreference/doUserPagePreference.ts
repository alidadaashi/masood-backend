import DoBase from "../../../base/dao/doBase";
import MdUserPagePreference from "./mdUserPagePreference";

class DoUserPagePreference extends DoBase<MdUserPagePreference> {
  constructor() {
    super(MdUserPagePreference.TABLE_NAME);
  }
}

export default new DoUserPagePreference();
