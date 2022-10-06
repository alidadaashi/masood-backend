import MdBase from "../../../base/models/mdBase";

class MdDocAndNoteTypeInstance extends MdBase {
  static TABLE_NAME = "docAndNoteType_instance";

  constructor(
    public dntiDocOrNoteTypeId: string,
    public dntiInstanceId: string,
    public dntiIsForAllCompanies: boolean,
    public dntiId?: string,
    public dntiCreatedAt?: string,
    public dntiUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdDocAndNoteTypeInstance, prefix = true): string {
    return prefix ? `${MdDocAndNoteTypeInstance.TABLE_NAME}.${k}` : k;
  }
}

export default MdDocAndNoteTypeInstance;
