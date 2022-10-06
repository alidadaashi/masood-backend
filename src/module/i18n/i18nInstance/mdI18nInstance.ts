import MdBase from "../../../base/models/mdBase";

class MdI18nInstance extends MdBase {
  static TABLE_NAME = "i18n_instance";

  constructor(
    public iiLanguageId: string,
    public iiInstanceId: string,
    public iiStatus: "active"|"inactive",
    public iiId?: string,
    public iiCreatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdI18nInstance, prefix = true): string {
    return prefix ? `${MdI18nInstance.TABLE_NAME}.${k}` : k;
  }
}

export default MdI18nInstance;
