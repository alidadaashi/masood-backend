class MdUserPreferences {
  static TABLE_NAME = "user_preferences";

  constructor(
    public upId: string,
    public upType: string,
    public upValue: string | boolean | number,
    public upUserEntityId?: string,
  ) {
  }

  static col(k: keyof MdUserPreferences, prefix = true): string {
    return prefix ? `${MdUserPreferences.TABLE_NAME}.${k}` : k;
  }
}

export default MdUserPreferences;
