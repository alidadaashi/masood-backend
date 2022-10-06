import { tpNotesStatus, tpRecordsScope } from "../../../shared/types/tpShared";
import MdBase from "../../../../base/models/mdBase";

class MdNotes extends MdBase {
  static TABLE_NAME = "notes";

  constructor(
    public nNoteTypeId: string,
    public nBody: string,
    public nStatus: tpNotesStatus,
    public nCreatedByUserId: string,
    public nRecordTypeEntityTypeId: string,
    public nScope?: tpRecordsScope,
    public nId?: string,
    public nCreatedAt?: string,
    public nUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdNotes, prefix = true): string {
    return prefix ? `${MdNotes.TABLE_NAME}.${k}` : k;
  }
}

export default MdNotes;
