import DoBase from "../../../base/dao/doBase";
import MdStickyNoteRef from "./mdStickyNoteRef";

class DoStickyNoteRef extends DoBase<MdStickyNoteRef> {
  constructor() {
    super(MdStickyNoteRef.TABLE_NAME);
  }
}

export default new DoStickyNoteRef();
