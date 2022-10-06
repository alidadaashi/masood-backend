import MdBase from "../../../base/models/mdBase";

class MdDocAndNoteTypeUser extends MdBase {
  static TABLE_NAME = "docAndNoteType_user";

  constructor(
    public dntuDocOrNoteTypeId: string,
    public dntuCreatedByUserId: string,
    public dntuId?: string,
    public dntuCreatedAt?: string,
    public dntuUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdDocAndNoteTypeUser, prefix = true): string {
    return prefix ? `${MdDocAndNoteTypeUser.TABLE_NAME}.${k}` : k;
  }
}

export default MdDocAndNoteTypeUser;
