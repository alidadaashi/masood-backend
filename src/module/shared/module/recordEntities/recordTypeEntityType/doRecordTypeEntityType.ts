import DoBase from "../../../../../base/dao/doBase";
import MdRecordTypeEntityType from "./mdRecordTypeEntityType";

class DoRecordTypeEntityType extends DoBase<MdRecordTypeEntityType> {
  constructor() {
    super(MdRecordTypeEntityType.TABLE_NAME);
  }
}

export default new DoRecordTypeEntityType();
