class MdUserUxPreference {
  static TABLE_NAME = "user_ux_preference";

  constructor(
    public uxpId: string,
    public uxpType: string,
    public uxpValue: string,
    public uxpUserEntityId?: string,
  ) {
  }

  static col(k: keyof MdUserUxPreference, prefix = true): string {
    return prefix ? `${MdUserUxPreference.TABLE_NAME}.${k}` : k;
  }
}

export default MdUserUxPreference;
