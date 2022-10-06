import DoBase from "../../../base/dao/doBase";
import MdDbSyncDetails from "./mdDbSyncDetails";

class DoDbSyncDetails extends DoBase<MdDbSyncDetails> {
  constructor() {
    super(MdDbSyncDetails.TABLE_NAME);
  }
}

export default new DoDbSyncDetails();
