import DoBase from "../../../../../base/dao/doBase";
import MdEntityType from "./mdEntityType";

class DoEntityType extends DoBase<MdEntityType> {
  constructor() {
    super(MdEntityType.TABLE_NAME);
  }
}

export default new DoEntityType();
