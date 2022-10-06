import DoBase from "../../../../base/dao/doBase";
import MdAttachmentValidity from "./mdAttachmentValidity";

class DoAttachmentValidity extends DoBase<MdAttachmentValidity> {
  constructor() {
    super(MdAttachmentValidity.TABLE_NAME);
  }
}

export default new DoAttachmentValidity();
