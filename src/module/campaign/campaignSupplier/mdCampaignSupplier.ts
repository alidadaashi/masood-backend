import MdBase from "../../../base/models/mdBase";
import { tpCampaignStatuses } from "../tpCampaign";

class MdCampaignSupplier extends MdBase {
  static TABLE_NAME = "campaign_supplier";

  constructor(
    public csCampId: string,
    public csSupplierId: string,
    public csStatus: tpCampaignStatuses,
    public csId?: string,
    public csCreatedAt?: string,
    public csUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdCampaignSupplier, prefix = true): string {
    return prefix ? `${MdCampaignSupplier.TABLE_NAME}.${k}` : k;
  }
}

export default MdCampaignSupplier;
