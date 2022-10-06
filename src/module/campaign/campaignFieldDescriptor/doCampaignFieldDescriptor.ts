import DoBase from "../../../base/dao/doBase";
import MdCampaignFieldDescriptor from "./mdCampaignFieldDescriptor";

class DoCampaignFieldDescriptor extends DoBase<MdCampaignFieldDescriptor> {
  constructor() {
    super(MdCampaignFieldDescriptor.TABLE_NAME);
  }
}

export default new DoCampaignFieldDescriptor();
