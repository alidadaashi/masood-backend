import MdBase from "../../base/models/mdBase";
import { tpStickyNotesStatus, tpStickyNotesCategory } from "../shared/types/tpShared";

class MdStickyNotes extends MdBase {
  static TABLE_NAME = "stickyNotes";

  constructor(
    public snId: string,
    public snSubject: string,
    public snBody?: string,
    public snType?: tpStickyNotesCategory,
    public snStatus?: tpStickyNotesStatus,
    public snFromUserId?: string,
    public snToMySelf?: boolean,
    public snSendAsEmail?: boolean,
    public snCreatedAt?: string,
    public snUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdStickyNotes, prefix = true): string {
    return prefix ? `${MdStickyNotes.TABLE_NAME}.${k}` : k;
  }
}

export default MdStickyNotes;
