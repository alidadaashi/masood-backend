import MdBase from "../../../base/models/mdBase";

class MdI18nInstanceOverride extends MdBase {
  static TABLE_NAME = "i18n_instance_override";

  constructor(
    public iioTranslationId: string,
    public iioInstanceId: string,
    public iioId?: string,
    public iioCreatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdI18nInstanceOverride, prefix = true): string {
    return prefix ? `${MdI18nInstanceOverride.TABLE_NAME}.${k}` : k;
  }
}

export default MdI18nInstanceOverride;
