import MdBase from "../../../../../base/models/mdBase";

class MdEntityType extends MdBase {
  static TABLE_NAME = "entityType";

  constructor(
    public etName: string,
    public etId?: string,
    public etCreatedAt?: string,
    public etUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdEntityType, prefix = true): string {
    return prefix ? `${MdEntityType.TABLE_NAME}.${k}` : k;
  }
}

export default MdEntityType;
