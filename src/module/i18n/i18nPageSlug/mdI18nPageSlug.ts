import MdBase from "../../../base/models/mdBase";

class MdI18nPageSlug extends MdBase {
  static TABLE_NAME = "i18n_page_slug";

  constructor(
    public ipsPageId: string,
    public ipsSlugId: string,
    public ipsId?: string,
    public ipsCreatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdI18nPageSlug, prefix = true): string {
    return prefix ? `${MdI18nPageSlug.TABLE_NAME}.${k}` : k;
  }
}

export default MdI18nPageSlug;
