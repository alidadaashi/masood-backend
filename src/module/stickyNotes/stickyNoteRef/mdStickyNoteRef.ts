import MdBase from "../../../base/models/mdBase";

class MdStickyNoteRef extends MdBase {
  static TABLE_NAME = "stickyNote_ref";

  constructor(
    public snrId: string,
    public snrStickyNoteId: string,
    public snrRecordTypeEntityTypeId?: string,
    public snrCreatedAt?: string,
    public snrUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdStickyNoteRef, prefix = true): string {
    return prefix ? `${MdStickyNoteRef.TABLE_NAME}.${k}` : k;
  }
}

export default MdStickyNoteRef;
