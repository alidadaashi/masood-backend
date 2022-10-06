import DoBase from "../../../base/dao/doBase";
import MdI18nPageOverride from "./mdI18nPageOverride";

class DoI18nPageOverride extends DoBase<MdI18nPageOverride> {
  constructor() {
    super(MdI18nPageOverride.TABLE_NAME);
  }
}

export default new DoI18nPageOverride();
