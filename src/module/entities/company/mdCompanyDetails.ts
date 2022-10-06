import MdBase from "../../../base/models/mdBase";

class MdCompanyDetails extends MdBase {
  static TABLE_NAME = "company_details";

  constructor(
    public cEntityId: string,
    public cInstanceEntityId: string,
    public cName: string,
    public cCreatedAt?: string | null,
    public cUpdatedAt?: string,
    public cId?: string,
  ) {
    super();
  }

  static col(k: keyof MdCompanyDetails, prefix = true): string {
    return prefix ? `${MdCompanyDetails.TABLE_NAME}.${k}` : k;
  }
}

export default MdCompanyDetails;
