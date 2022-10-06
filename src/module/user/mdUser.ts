import MdBase from "../../base/models/mdBase";

class MdUser extends MdBase {
  static TABLE_NAME = "user";

  constructor(
    public uFirstName: string,
    public uLastName: string,
    public uEntityId: string,
    public uCreatedAt?: string,
    public uId?: string,
  ) {
    super();
  }

  static col(k: keyof MdUser, prefix = true): string {
    return prefix ? `${MdUser.TABLE_NAME}.${k}` : k;
  }
}

export default MdUser;
