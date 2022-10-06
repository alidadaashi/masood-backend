import MdBase from "../../../base/models/mdBase";

class MdI18nPageOverride extends MdBase {
  static TABLE_NAME = "i18n_page_override";

  constructor(
    public ipoTranslationId: string,
    public ipoPageId: string,
    public ipoInstanceId?: string|null,
    public ipoId?: string,
    public ipoCreatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdI18nPageOverride, prefix = true): string {
    return prefix ? `${MdI18nPageOverride.TABLE_NAME}.${k}` : k;
  }
}

export default MdI18nPageOverride;
