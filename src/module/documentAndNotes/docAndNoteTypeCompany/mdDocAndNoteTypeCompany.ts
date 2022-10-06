import MdBase from "../../../base/models/mdBase";

class MdDocAndNoteTypeCompany extends MdBase {
  static TABLE_NAME = "docAndNoteType_company";

  constructor(
    public dntcDocOrNoteTypeId: string,
    public dntcCompanyId: string,
    public dntcId?: string,
    public dntcCreatedAt?: string,
    public dntcUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdDocAndNoteTypeCompany, prefix = true): string {
    return prefix ? `${MdDocAndNoteTypeCompany.TABLE_NAME}.${k}` : k;
  }
}

export default MdDocAndNoteTypeCompany;
