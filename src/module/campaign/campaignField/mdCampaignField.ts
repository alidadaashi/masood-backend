import MdBase from "../../../base/models/mdBase";

class MdCampaignField extends MdBase {
  static TABLE_NAME = "campaign_field";

  constructor(
    public cfCampId: string,
    public cfFieldDescriptorId: string,
    public cfEditableByVendor?: boolean,
    public cfEditableBySupplier?: boolean,
    public cfId?: string,
    public cfCreatedAt?: string,
    public cfUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdCampaignField, prefix = true): string {
    return prefix ? `${MdCampaignField.TABLE_NAME}.${k}` : k;
  }
}

export default MdCampaignField;
