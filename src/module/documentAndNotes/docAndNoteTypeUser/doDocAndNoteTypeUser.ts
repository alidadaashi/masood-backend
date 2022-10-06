import DoBase from "../../../base/dao/doBase";
import MdDocAndNoteTypeUser from "./mdDocAndNoteTypeUser";

class DoDocAndNoteTypeUser extends DoBase<MdDocAndNoteTypeUser> {
  constructor() {
    super(MdDocAndNoteTypeUser.TABLE_NAME);
  }
}

export default new DoDocAndNoteTypeUser();
