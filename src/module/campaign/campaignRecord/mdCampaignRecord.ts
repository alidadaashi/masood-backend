import MdBase from "../../../base/models/mdBase";

class MdCampaignRecord extends MdBase {
  static TABLE_NAME = "campaign_record";

  constructor(
    public crId?: string,
    public crCampId?: string,
    public crCreatedAt?: string,
    public crUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdCampaignRecord, prefix = true): string {
    return prefix ? `${MdCampaignRecord.TABLE_NAME}.${k}` : k;
  }
}

export default MdCampaignRecord;
