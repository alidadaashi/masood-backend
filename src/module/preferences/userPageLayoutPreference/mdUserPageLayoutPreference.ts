class MdUserPageLayoutPreference {
  static TABLE_NAME = "user_page_layout_preference";

  constructor(
    public uplpPreference: string,
    public uplpName: string,
    public uplpPagePreferenceId: string,
    public uplpId: string,
  ) {
  }

  static col(k: keyof MdUserPageLayoutPreference, prefix = true): string {
    return prefix ? `${MdUserPageLayoutPreference.TABLE_NAME}.${k}` : k;
  }
}

export default MdUserPageLayoutPreference;
