import MdBase from "../../../base/models/mdBase";

class MdDomainDetails extends MdBase {
  static TABLE_NAME = "domain_details";

  constructor(
    public dEntityId: string,
    public dName: string,
    public dCreatedAt?: string,
    public dId?: string,
  ) {
    super();
  }

  static col(k: keyof MdDomainDetails, prefix = true): string {
    return prefix ? `${MdDomainDetails.TABLE_NAME}.${k}` : k;
  }
}

export default MdDomainDetails;
