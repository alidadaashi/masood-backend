class MdUserPagePreference {
  static TABLE_NAME = "user_page_preference";

  constructor(
    public uppEntityId: string,
    public uppKey: string,
    public uppFavoriteLayoutId: string,
    public uppFavoriteQueryId: string,
    public uppId: string,
  ) {
  }

  static col(k: keyof MdUserPagePreference, prefix = true): string {
    return prefix ? `${MdUserPagePreference.TABLE_NAME}.${k}` : k;
  }
}

export default MdUserPagePreference;
