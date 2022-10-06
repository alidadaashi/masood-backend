import DoBase from "../../../../base/dao/doBase";
import MdAttachmentDescription from "./mdAttachmentDescription";

class DoAttachmentDescription extends DoBase<MdAttachmentDescription> {
  constructor() {
    super(MdAttachmentDescription.TABLE_NAME);
  }
}

export default new DoAttachmentDescription();
