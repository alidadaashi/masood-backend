import DoBase from "../../../base/dao/doBase";
import MdUserSelectedInstance from "./mdUserSelectedInstance";

class DoUserSelectedInstance extends DoBase<MdUserSelectedInstance> {
  constructor() {
    super(MdUserSelectedInstance.TABLE_NAME);
  }
}

export default new DoUserSelectedInstance();
