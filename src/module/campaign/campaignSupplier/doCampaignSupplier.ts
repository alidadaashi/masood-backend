import DoBase from "../../../base/dao/doBase";
import MdCampaignSupplier from "./mdCampaignSupplier";

class DoCampaignSupplier extends DoBase<MdCampaignSupplier> {
  constructor() {
    super(MdCampaignSupplier.TABLE_NAME);
  }
}

export default new DoCampaignSupplier();
