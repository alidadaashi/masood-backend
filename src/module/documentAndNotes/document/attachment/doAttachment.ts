import DoBase from "../../../../base/dao/doBase";
import MdAttachment from "./mdAttachment";

class DoAttachment extends DoBase<MdAttachment> {
  constructor() {
    super(MdAttachment.TABLE_NAME);
  }
}

export default new DoAttachment();
