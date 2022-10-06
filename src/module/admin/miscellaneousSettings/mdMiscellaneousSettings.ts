import MdBase from "../../../base/models/mdBase";

class MdMiscellaneousSettings extends MdBase {
  static TABLE_NAME = "miscellaneous_settings";

  constructor(
    public msType: string,
    public msValue: string,
    public msId?: string,
    public msCreatedAt?: string,
    public msEntityId?: string,
    public msUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdMiscellaneousSettings, prefix = true): string {
    return prefix ? `${MdMiscellaneousSettings.TABLE_NAME}.${k}` : k;
  }
}

export default MdMiscellaneousSettings;
