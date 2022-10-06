import MdBase from "../../../base/models/mdBase";

class MdLanguages extends MdBase {
  static TABLE_NAME = "languages";

  constructor(
    public lShortName: string,
    public lFullName: string,
    public lStatus: "active"|"inactive",
    public lId?: string,
    public lCreatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdLanguages, prefix = true): string {
    return prefix ? `${MdLanguages.TABLE_NAME}.${k}` : k;
  }
}

export default MdLanguages;
