import DoBase from "../../../base/dao/doBase";
import MdCampaignUserToken from "./mdCampaignUserToken";

class DoCampaignUserToken extends DoBase<MdCampaignUserToken> {
  constructor() {
    super(MdCampaignUserToken.TABLE_NAME);
  }
}

export default new DoCampaignUserToken();
