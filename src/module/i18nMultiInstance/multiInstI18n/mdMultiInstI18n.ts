import MdBase from "../../../base/models/mdBase";
import { COL_SLG_ACTIVE_STATUS, COL_SLG_LOCKED_STATUS } from "../../shared/constants/dtI18nModuleConstants";

class MdI18n extends MdBase {
  static TABLE_NAME = "i18n";

  constructor(
    public iSlug: string,
    public iType: typeof COL_SLG_ACTIVE_STATUS| typeof COL_SLG_LOCKED_STATUS,
    public iId?: string,
    public iCreatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdI18n, prefix = true): string {
    return prefix ? `${MdI18n.TABLE_NAME}.${k}` : k;
  }
}

export default MdI18n;
