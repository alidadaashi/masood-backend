import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdI18nDynamic from "./mdI18nDynamic";
import MdI18nTranslations from "../i18nTranslations/mdI18nTranslations";
import { tpGetType } from "../../shared/types/tpShared";
import MdI18n from "../i18n/mdI18n";

class DoI18nDynamic extends DoBase<MdI18nDynamic> {
  constructor() {
    super(MdI18nDynamic.TABLE_NAME);
  }

  getDynamicItemTranslation(
    trx: Transaction,
    slug: string,
    {
      langId, itemType, itemPkKey, selectedInstanceId,
    }:{
      selectedInstanceId: string
      langId: string,
      itemType: MdI18nDynamic["idItemType"],
      itemPkKey: string,
    },
  ):QueryBuilder {
    return trx(this.tableName)
      .select(MdI18nTranslations.col("itText"))
      .join(MdI18nTranslations.TABLE_NAME, (qbJoin) => {
        qbJoin.on(MdI18nTranslations.col("itId"), this.col("idTranslationId"))
          .andOn(MdI18nTranslations.col("itType"), trx.raw("?",
            [tpGetType<MdI18nTranslations["itType"]>("dynamicNormal")]))
          .andOn(MdI18nTranslations.col("itLangId"), trx.raw("?", [langId]));
      })
      .join(MdI18n.TABLE_NAME, (qbJoin) => {
        qbJoin.on(MdI18n.col("iId"), MdI18nTranslations.col("itI18nId"))
          .andOn(MdI18n.col("iSlug"), trx.raw("?", [slug]));
      })
      .where(this.col("idItemType"), itemType)
      .andWhere(this.col("idItemId"), trx.raw("??", [itemPkKey]))
      .andWhere(this.col("idInstanceId"), selectedInstanceId);
  }
}

export default new DoI18nDynamic();
