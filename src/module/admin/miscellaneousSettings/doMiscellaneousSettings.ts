import DoBase from "../../../base/dao/doBase";
import MdMiscellaneousSettings from "./mdMiscellaneousSettings";

class DoMiscellaneousSettings extends DoBase<MdMiscellaneousSettings> {
  constructor() {
    super(MdMiscellaneousSettings.TABLE_NAME);
  }
}

export default new DoMiscellaneousSettings();
