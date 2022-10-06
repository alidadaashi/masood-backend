import DoBase from "../../../base/dao/doBase";
import MdCampaignRecord from "./mdCampaignRecord";

class DoCampaignRecord extends DoBase<MdCampaignRecord> {
  constructor() {
    super(MdCampaignRecord.TABLE_NAME);
  }
}

export default new DoCampaignRecord();
