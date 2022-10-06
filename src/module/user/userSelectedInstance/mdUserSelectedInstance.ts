import MdBase from "../../../base/models/mdBase";

class MdUserSelectedInstance extends MdBase {
  static TABLE_NAME = "user_selected_instance";

  constructor(
    public usiSelectedInstanceEntityId: string,
    public usiUserEntityId: string,
    public usiCreatedAt?: string,
    public usiId?: string,
  ) {
    super();
  }

  static col(k: keyof MdUserSelectedInstance, prefix = true): string {
    return prefix ? `${MdUserSelectedInstance.TABLE_NAME}.${k}` : k;
  }
}

export default MdUserSelectedInstance;
