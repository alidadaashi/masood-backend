import MdBase from "../../base/models/mdBase";

class MdPages extends MdBase {
  static TABLE_NAME = "pages";

  constructor(
    public pgModuleId: string,
    public pgName: string,
    public pgCreatedAt?: string,
    public pgId?: string,
  ) {
    super();
  }

  static col(k: keyof MdPages, prefix = true): string {
    return prefix ? `${MdPages.TABLE_NAME}.${k}` : k;
  }
}

export default MdPages;
