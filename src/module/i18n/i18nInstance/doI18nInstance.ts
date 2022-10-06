import DoBase from "../../../base/dao/doBase";
import MdI18nInstance from "./mdI18nInstance";

class DoI18nInstance extends DoBase<MdI18nInstance> {
  constructor() {
    super(MdI18nInstance.TABLE_NAME);
  }
}

export default new DoI18nInstance();
