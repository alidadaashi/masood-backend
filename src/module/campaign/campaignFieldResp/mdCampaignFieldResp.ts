import MdBase from "../../../base/models/mdBase";

class MdCampaignFieldResp extends MdBase {
  static TABLE_NAME = "campaign_field_resp";

  constructor(
    public cfrCampRecordId: string,
    public cfrCampInstanceId: string,
    public cfrCampSupplierId: string,
    public cfrFieldDescriptorId: string,
    public cfrResponseBy: "instance"|"supplier",
    public cfrValue: string,
    public cfrId?: string,
    public cfrCreatedAt?: string,
    public cfrUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdCampaignFieldResp, prefix = true): string {
    return prefix ? `${MdCampaignFieldResp.TABLE_NAME}.${k}` : k;
  }
}

export default MdCampaignFieldResp;
