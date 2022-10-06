import MdBase from "../../../../base/models/mdBase";

class MdAttachmentFile extends MdBase {
  static TABLE_NAME = "attachment_file";

  constructor(
    public afAttachmentId: string,
    public afFileId: string,
    public afId?: string,
    public afCreatedAt?: string,
    public afUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdAttachmentFile, prefix = true): string {
    return prefix ? `${MdAttachmentFile.TABLE_NAME}.${k}` : k;
  }
}

export default MdAttachmentFile;
