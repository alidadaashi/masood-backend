import DoBase from "../../../base/dao/doBase";
import MdUserUxPreference from "./mdUserUxPreference";

class DoUserUxPreference extends DoBase<MdUserUxPreference> {
  constructor() {
    super(MdUserUxPreference.TABLE_NAME);
  }
}

export default new DoUserUxPreference();
