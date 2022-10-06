import DoBase from "../../../base/dao/doBase";
import MdCampaignFieldResp from "./mdCampaignFieldResp";

class DoCampaignFieldResp extends DoBase<MdCampaignFieldResp> {
  constructor() {
    super(MdCampaignFieldResp.TABLE_NAME);
  }
}

export default new DoCampaignFieldResp();
