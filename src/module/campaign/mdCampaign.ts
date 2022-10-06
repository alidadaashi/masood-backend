import MdBase from "../../base/models/mdBase";

class MdCampaign extends MdBase {
  static TABLE_NAME = "campaign";

  constructor(
    public cEntityId: string,
    public cCreator: string,
    public cTextNo: string,
    public cText: string,
    public cCode: string,
    public cErpCode: string,
    public cDescription: string,
    public cReferenceText: string,
    public cStartDate: string,
    public cEndDate: string,
    public cReleaseDate: string,
    public cDeadline: string,
    public cInstanceId: string,
    public cId?: string,
    public cCreatedAt?: string,
    public cUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdCampaign, prefix = true): string {
    return prefix ? `${MdCampaign.TABLE_NAME}.${k}` : k;
  }
}

export default MdCampaign;
