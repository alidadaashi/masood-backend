import MdBase from "../../../base/models/mdBase";

class MdCampaignUserToken extends MdBase {
  static TABLE_NAME = "campaign_user_token";

  constructor(
    public cutExpiry: string,
    public cutToken: string,
    public cutEntityId: string,
    public cutCreatedAt?: string,
    public cutId?: string,
  ) {
    super();
  }

  static col(k: keyof MdCampaignUserToken, prefix = true): string {
    return prefix ? `${MdCampaignUserToken.TABLE_NAME}.${k}` : k;
  }
}

export default MdCampaignUserToken;
