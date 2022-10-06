import MdBase from "../../../base/models/mdBase";

class MdGroupDetails extends MdBase {
  static TABLE_NAME = "group_details";

  constructor(
    public gEntityId: string,
    public gDomainEntityId: string,
    public gName: string,
    public gCreatedAt?: string|null,
    public gUpdatedAt?: string,
    public refSpId?: string,
    public gId?: string,
  ) {
    super();
  }

  static col(k: keyof MdGroupDetails, prefix = true): string {
    return prefix ? `${MdGroupDetails.TABLE_NAME}.${k}` : k;
  }
}

export default MdGroupDetails;
