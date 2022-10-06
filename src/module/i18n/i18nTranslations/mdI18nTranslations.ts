import MdBase from "../../../base/models/mdBase";

class MdI18nTranslations extends MdBase {
  static TABLE_NAME = "i18n_translations";

  constructor(
    public itI18nId: string,
    public itLangId: string,
    public itText: string,
    public itType: "staticNormal"|"dynamicNormal"|"staticMisc"|"label",
    public itOverrideType: "stPageOverride"|"stInstanceOverride"|null,
    public itId?: string,
    public itCreatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdI18nTranslations, prefix = true): string {
    return prefix ? `${MdI18nTranslations.TABLE_NAME}.${k}` : k;
  }
}

export default MdI18nTranslations;
