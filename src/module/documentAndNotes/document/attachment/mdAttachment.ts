import { tpRecordsScope } from "../../../shared/types/tpShared";
import MdBase from "../../../../base/models/mdBase";

class MdAttachment extends MdBase {
  static TABLE_NAME = "attachment";

  constructor(
    public aDocTypeId: string,
    public aCreatedByUserId: string,
    public aRecordTypeEntityTypeId: string,
    public aScope?: tpRecordsScope,
    public aId?: string,
    public aCreatedAt?: string,
    public aUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdAttachment, prefix = true): string {
    return prefix ? `${MdAttachment.TABLE_NAME}.${k}` : k;
  }
}

export default MdAttachment;
