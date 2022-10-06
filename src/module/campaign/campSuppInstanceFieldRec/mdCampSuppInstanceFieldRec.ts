import MdBase from "../../../base/models/mdBase";

class MdCampaignInstanceFieldRec extends MdBase {
  static TABLE_NAME = "campaign_instance_field_record";

  constructor(
    public cifId: string,
    public cifCampRecordId: string,
    public cifCampFieldId: string,
    public cifValue: string|null,
    public cifCreatedAt?: string,
    public cifUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdCampaignInstanceFieldRec, prefix = true): string {
    return prefix ? `${MdCampaignInstanceFieldRec.TABLE_NAME}.${k}` : k;
  }
}

export default MdCampaignInstanceFieldRec;
