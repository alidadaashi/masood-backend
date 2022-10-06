import MdBase from "../../../../base/models/mdBase";

class MdNoteHistoryLog extends MdBase {
  static TABLE_NAME = "noteHistoryLog";

  constructor(
    public nhlRevisionId: string,
    public nhlNoteId: string,
    public nhlId?: string,
    public nhlCreatedAt?: string,
    public nhlUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdNoteHistoryLog, prefix = true): string {
    return prefix ? `${MdNoteHistoryLog.TABLE_NAME}.${k}` : k;
  }
}

export default MdNoteHistoryLog;
