import { Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdI18nPageSlug from "./mdI18nPageSlug";
import MdPages from "../../pages/mdPages";
import MdModule from "../../privilege/module/mdModule";
import MdI18n from "../i18n/mdI18n";
import { COL_SLG_ID_ALIAS } from "../../shared/constants/dtI18nModuleConstants";

class DoI18nPageSlug extends DoBase<MdI18nPageSlug> {
  constructor() {
    super(MdI18nPageSlug.TABLE_NAME);
  }

  getPageSlugDetails(trx: Transaction):Promise<{
    pageId: string, pageName: string, moduleName: string, slugId: string, slugName: string
  }[]> {
    return trx(this.tableName)
      .select([
        trx.raw("?? as ??", [MdPages.col("pgId"), "pageId"]),
        trx.raw("?? as ??", [MdPages.col("pgName"), "pageName"]),
        trx.raw("?? as ??", [MdModule.col("mModuleName"), "moduleName"]),
        trx.raw("?? as ??", [MdI18n.col("iId"), COL_SLG_ID_ALIAS]),
        trx.raw("?? as ??", [MdI18n.col("iSlug"), "slugName"]),
      ])
      .join(MdI18n.TABLE_NAME, MdI18n.col("iId"), this.col("ipsSlugId"))
      .join(MdPages.TABLE_NAME, MdPages.col("pgId"), this.col("ipsPageId"))
      .join(MdModule.TABLE_NAME, MdModule.col("mModuleId"), MdPages.col("pgModuleId"));
  }
}

export default new DoI18nPageSlug();
