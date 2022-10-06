import { Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdI18nTranslations from "./mdI18nTranslations";
import MdI18nPageOverride from "../i18nPageOverride/mdI18nPageOverride";
import { tpGetType } from "../../shared/types/tpShared";
import MdI18nInstanceOverride from "../i18nInstanceOverride/mdI18nInstanceOverride";
import MdI18nDynamic from "../i18nDynamic/mdI18nDynamic";

class DoI18nTranslations extends DoBase<MdI18nTranslations> {
  constructor() {
    super(MdI18nTranslations.TABLE_NAME);
  }

  getInstanceOverrideTranslationForSlug(
    trx: Transaction,
    pageId: string,
    slugId: string,
    { langId, instanceId }: { langId: string, instanceId: string | null },
  ): Promise<{ translationText: string, translationId?: string }> {
    return trx(this.tableName)
      .select([
        trx.raw("?? as ??", [this.col("itText"), "translationText"]),
        trx.raw("?? as ??", [MdI18nInstanceOverride.col("iioTranslationId"), "translationId"]),
      ])
      .join(MdI18nInstanceOverride.TABLE_NAME, MdI18nInstanceOverride.col("iioTranslationId"), this.col("itId"))
      .where({
        [this.col("itI18nId")]: slugId,
        [this.col("itOverrideType")]: tpGetType<MdI18nTranslations["itOverrideType"]>("stInstanceOverride"),
        [this.col("itLangId")]: langId,
        [MdI18nInstanceOverride.col("iioInstanceId")]: instanceId,
      })
      .first();
  }

  getPageOverrideTranslationForSlug(
    trx: Transaction,
    pageId: string,
    slugId: string,
    { langId, instanceId }:{ langId: string, instanceId?: string|null },
  ): Promise<{ translationText: string, translationId?: string }> {
    return trx(this.tableName)
      .select([
        trx.raw("?? as ??", [this.col("itText"), "translationText"]),
        trx.raw("?? as ??", [MdI18nPageOverride.col("ipoTranslationId"), "translationId"]),
      ])
      .join(MdI18nPageOverride.TABLE_NAME, MdI18nPageOverride.col("ipoTranslationId"), this.col("itId"))
      .where({
        [this.col("itI18nId")]: slugId,
        [this.col("itOverrideType")]: tpGetType<MdI18nTranslations["itOverrideType"]>("stPageOverride"),
        [this.col("itLangId")]: langId,
        [MdI18nPageOverride.col("ipoPageId")]: pageId,
        [MdI18nPageOverride.col("ipoInstanceId")]: instanceId,
      })
      .first();
  }

  getDefaultTranslationForSlug(
    trx: Transaction, slugId: string, langId: string, types: string[],
  ):Promise<{translationText: string}> {
    return trx(this.tableName).select([
      trx.raw("?? as ??", [this.col("itText"), "translationText"]),
    ])
      .where(this.col("itI18nId"), slugId)
      .andWhere(this.col("itLangId"), langId)
      .whereNull(this.col("itOverrideType"))
      .whereIn(this.col("itType"), types)
      .first();
  }

  getDynamicTranslationForSlug(
    trx: Transaction, slugId: string,
    { langId, instanceId, itemId }: { langId: string, instanceId?: string | null, itemId: string }, types: string[],
  ): Promise<{ translationText: string, translationId?: string }> {
    return trx(this.tableName).select([
      trx.raw("?? as ??", [this.col("itText"), "translationText"]),
      trx.raw("?? as ??", [this.col("itId"), "translationId"]),
    ])
      .join(MdI18nDynamic.TABLE_NAME, MdI18nDynamic.col("idTranslationId"), this.col("itId"))
      .where(this.col("itI18nId"), slugId)
      .andWhere(this.col("itLangId"), langId)
      .andWhere(MdI18nDynamic.col("idItemId"), itemId)
      .andWhere(MdI18nDynamic.col("idInstanceId"), instanceId)
      .whereNull(this.col("itOverrideType"))
      .whereIn(this.col("itType"), types)
      .first();
  }
}

export default new DoI18nTranslations();
