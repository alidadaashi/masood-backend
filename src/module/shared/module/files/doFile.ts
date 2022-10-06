import DoBase from "../../../../base/dao/doBase";
import MdFile from "./mdFile";

class DoFile extends DoBase<MdFile> {
  constructor() {
    super(MdFile.TABLE_NAME);
  }
}

export default new DoFile();
