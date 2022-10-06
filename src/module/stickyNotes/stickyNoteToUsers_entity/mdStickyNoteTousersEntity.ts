import MdBase from "../../../base/models/mdBase";

class MdStickyNoteTousersEntity extends MdBase {
  static TABLE_NAME = "stickyNoteToUsers_entity";

  constructor(
    public sntueId?: string,
    public sntueStickyNoteId?: string,
    public sntueToUserId?: string,
    public sntueInstanceId?: string,
    public sntueCompanyId?: string,
    public sntueCreatedAt?: string,
    public sntueUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdStickyNoteTousersEntity, prefix = true): string {
    return prefix ? `${MdStickyNoteTousersEntity.TABLE_NAME}.${k}` : k;
  }
}

export default MdStickyNoteTousersEntity;
