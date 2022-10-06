import MdBase from "../../../../base/models/mdBase";

class MdAttachmentValidity extends MdBase {
  static TABLE_NAME = "attachmentValidity";

  constructor(
    public avAttachmentId: string,
    public avValidityStartDate: string,
    public avValidityEndDate: string,
    public avId?: string,
    public avCreatedAt?: string,
    public avUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdAttachmentValidity, prefix = true): string {
    return prefix ? `${MdAttachmentValidity.TABLE_NAME}.${k}` : k;
  }
}

export default MdAttachmentValidity;
