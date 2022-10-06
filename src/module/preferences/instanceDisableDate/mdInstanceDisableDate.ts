import MdBase from "../../../base/models/mdBase";

class MdInstanceDisableDate extends MdBase {
  static TABLE_NAME = "instance_disable_dates";

  constructor(
    public iddStartDate: Date,
    public iddEndDate: Date,
    public iddStatus: boolean,
    public iddDescription: string,
    public iddEntityId: string,
    public iddId?: string,
    public iddCreatedAt?: string,
    public iddUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdInstanceDisableDate, prefix = true): string {
    return prefix ? `${MdInstanceDisableDate.TABLE_NAME}.${k}` : k;
  }
}

export default MdInstanceDisableDate;
