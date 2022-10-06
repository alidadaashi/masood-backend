class MdUserPageQueryPreference {
  static TABLE_NAME = "user_page_query_preference";

  constructor(
    public upqpPreference: string,
    public upqpName: string,
    public upqpPagePreferenceId?: string,
    public upqpId?: string,
  ) {
  }

  static col(k: keyof MdUserPageQueryPreference, prefix = true): string {
    return prefix ? `${MdUserPageQueryPreference.TABLE_NAME}.${k}` : k;
  }
}

export default MdUserPageQueryPreference;
