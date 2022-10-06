import MdBase from "../../../base/models/mdBase";

class MdEntityUser extends MdBase {
  static TABLE_NAME = "entity_user";

  constructor(
    public euEntityId: string,
    public euUserEntityId: string,
    public euCreatedAt?: string,
    public euId?: string,
    public refId?: string,
  ) {
    super();
  }

  static col(k: keyof MdEntityUser, prefix = true): string {
    return prefix ? `${MdEntityUser.TABLE_NAME}.${k}` : k;
  }
}

export default MdEntityUser;
