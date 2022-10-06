import MdBase from "../../../../base/models/mdBase";

class MdAttachmentDescription extends MdBase {
  static TABLE_NAME = "attachmentDescription";

  constructor(
    public adAttachmentId: string,
    public adDescription: string,
    public adId?: string,
    public adCreatedAt?: string,
    public adUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdAttachmentDescription, prefix = true): string {
    return prefix ? `${MdAttachmentDescription.TABLE_NAME}.${k}` : k;
  }
}

export default MdAttachmentDescription;
