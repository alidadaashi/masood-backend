import DoBase from "../../../../base/dao/doBase";
import MdNoteHistoryLog from "./mdNoteHistoryLog";

class DoNoteHistoryLog extends DoBase<MdNoteHistoryLog> {
  constructor() {
    super(MdNoteHistoryLog.TABLE_NAME);
  }
}

export default new DoNoteHistoryLog();
