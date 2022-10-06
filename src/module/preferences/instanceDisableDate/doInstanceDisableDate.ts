import DoBase from "../../../base/dao/doBase";
import MdInstanceDisableDate from "./mdInstanceDisableDate";

class DoInstanceDisableDate extends DoBase<MdInstanceDisableDate> {
  constructor() {
    super(MdInstanceDisableDate.TABLE_NAME);
  }
}

export default new DoInstanceDisableDate();
