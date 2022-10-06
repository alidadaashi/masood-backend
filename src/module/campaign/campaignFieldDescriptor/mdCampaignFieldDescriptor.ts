import MdBase from "../../../base/models/mdBase";

class MdCampaignFieldDescriptor extends MdBase {
  static TABLE_NAME = "campaign_field_descriptor";

  constructor(
    public cfdSlug: string,
    public cfdAcceptableRespType: string,
    public cfdName: string,
    public cfdId?: string,
    public cfdCreatedAt?: string,
    public cfdUpdatedAt?: string,

  ) {
    super();
  }

  static col(k: keyof MdCampaignFieldDescriptor, prefix = true): string {
    return prefix ? `${MdCampaignFieldDescriptor.TABLE_NAME}.${k}` : k;
  }
}

export default MdCampaignFieldDescriptor;
