import DoBase from "../../../base/dao/doBase";
import MdI18nInstanceOverride from "./mdI18nInstanceOverride";

class DoI18nInstanceOverride extends DoBase<MdI18nInstanceOverride> {
  constructor() {
    super(MdI18nInstanceOverride.TABLE_NAME);
  }
}

export default new DoI18nInstanceOverride();
