import DoBase from "../../base/dao/doBase";
import MdPages from "./mdPages";

class DoPages extends DoBase<MdPages> {
  constructor() {
    super(MdPages.TABLE_NAME);
  }
}

export default new DoPages();
