import MdBase from "../../../../../base/models/mdBase";

class MdRecordTypeEntityType extends MdBase {
  static TABLE_NAME = "recordType_entityType";

  constructor(
    public rtetRecordId: string,
    public rtetEntityTypeId: string,
    public rtetRecordTypeId: string,
    public rtetId?: string,
    public rtetCreatedAt?: string,
    public rtetUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdRecordTypeEntityType, prefix = true): string {
    return prefix ? `${MdRecordTypeEntityType.TABLE_NAME}.${k}` : k;
  }
}

export default MdRecordTypeEntityType;
