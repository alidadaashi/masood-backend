import DoBase from "../../../../base/dao/doBase";
import MdAttachmentFile from "./mdAttachmentFile";

class DoAttachmentFile extends DoBase<MdAttachmentFile> {
  constructor() {
    super(MdAttachmentFile.TABLE_NAME);
  }
}

export default new DoAttachmentFile();
