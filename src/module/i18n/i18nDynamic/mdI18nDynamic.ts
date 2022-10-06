import MdBase from "../../../base/models/mdBase";

class MdI18nDynamic extends MdBase {
  static TABLE_NAME = "i18n_dynamic";

  constructor(
    public idTranslationId: string,
    public idInstanceId: string,
    public idItemId: string,
    public idItemType: string|"product",
    public idId?: string,
    public idCreatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdI18nDynamic, prefix = true): string {
    return prefix ? `${MdI18nDynamic.TABLE_NAME}.${k}` : k;
  }
}

export default MdI18nDynamic;
