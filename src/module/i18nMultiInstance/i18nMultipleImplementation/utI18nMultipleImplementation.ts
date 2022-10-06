import { QueryBuilder, Transaction } from "knex";
import MdGroupDetails from "../../entities/group/mdGroupDetails";
import MdI18nInstanceOverride from "../../i18n/i18nInstanceOverride/mdI18nInstanceOverride";
import MdI18nPageOverride from "../../i18n/i18nPageOverride/mdI18nPageOverride";
import MdI18nPageSlug from "../../i18n/i18nPageSlug/mdI18nPageSlug";
import MdI18nTranslations from "../../i18n/i18nTranslations/mdI18nTranslations";
import MdLanguages from "../languages/mdLanguages";
import { getTransAndInstSelectionObjectQb, getTransSelectionObjectQb } from "../multiInstI18n/utMultiInstI18n";
import { tpGetType } from "../../shared/types/tpShared";

const utGetI18nInstanceMultipleImpTranslationsQb = (
  trx: Transaction, defaultTranslationQb: QueryBuilder, {
    instancePageWideQb, appPageWideQb, instanceWideQb, lShortName,
  }: {
    instancePageWideQb: QueryBuilder, appPageWideQb: QueryBuilder, instanceWideQb: QueryBuilder, lShortName: string,
  },
) => [
  trx.raw(`
      case
        -- instance page wide
        when exists (${instancePageWideQb}) then (${instancePageWideQb})
        -- instance wide
        when exists (${instanceWideQb}) then (${instanceWideQb})
        -- app page wide
        when exists (${appPageWideQb}) then (${appPageWideQb})
        -- app wide
        else (${defaultTranslationQb})
      end as ??
    `, [lShortName]),
];

export const utI18nInstanceMultipleImpTranslationsQb = (
  trx: Transaction, qb: QueryBuilder, {
    language, typesOfTranslationsRetrieve, instanceId,
  }: {
    language: MdLanguages, typesOfTranslationsRetrieve: MdI18nTranslations["itType"][], instanceId: string,
  },
): QueryBuilder => {
  const { lId, lShortName } = language;
  const utPageWideQb = (insId?: string) => trx(MdI18nTranslations.TABLE_NAME)
    .select(insId ? getTransAndInstSelectionObjectQb : getTransSelectionObjectQb)
    .join(MdI18nPageOverride.TABLE_NAME, (qbJoin) => {
      qbJoin.on(MdI18nPageOverride.col("ipoTranslationId"), MdI18nTranslations.col("itId"))
        .andOn(MdI18nPageOverride.col("ipoPageId"), MdI18nPageSlug.col("ipsPageId"));
      if (insId) qbJoin.andOn(MdI18nPageOverride.col("ipoInstanceId"), trx.raw("?", [insId]));
      else qbJoin.onNull(MdI18nPageOverride.col("ipoInstanceId"));
    })
    .where(MdI18nTranslations.col("itOverrideType"), tpGetType<MdI18nTranslations["itOverrideType"]>("stPageOverride"))
    .whereIn(MdI18nTranslations.col("itType"), typesOfTranslationsRetrieve)
    .andWhere(MdI18nTranslations.col("itLangId"), lId)
    .andWhereRaw("?? = ??", [MdI18nTranslations.col("itI18nId"), MdI18nPageSlug.col("ipsSlugId")]);

  const instanceWideQb = trx(MdI18nTranslations.TABLE_NAME)
    .select(getTransAndInstSelectionObjectQb)
    .join(MdI18nInstanceOverride.TABLE_NAME, (qbJoin) => {
      qbJoin.on(MdI18nInstanceOverride.col("iioTranslationId"), MdI18nTranslations.col("itId"))
        .andOn(MdI18nInstanceOverride.col("iioInstanceId"), trx.raw("?", instanceId));
    }).join(MdGroupDetails.TABLE_NAME, (qbJoin) => {
      qbJoin.on(MdGroupDetails.col("gEntityId"), MdI18nInstanceOverride.col("iioInstanceId"));
    })
    .where(MdI18nTranslations.col("itOverrideType"),
      tpGetType<MdI18nTranslations["itOverrideType"]>("stInstanceOverride"))
    .andWhereRaw("?? = ??", [MdI18nTranslations.col("itI18nId"), MdI18nPageSlug.col("ipsSlugId")])
    .andWhere(MdI18nTranslations.col("itLangId"), lId)
    .whereIn(MdI18nTranslations.col("itType"), typesOfTranslationsRetrieve);

  const defaultTranslationQb = trx(MdI18nTranslations.TABLE_NAME)
    .select(getTransSelectionObjectQb)
    .whereNull(MdI18nTranslations.col("itOverrideType"))
    .andWhere(MdI18nTranslations.col("itLangId"), lId)
    .andWhereRaw("?? = ??", [MdI18nTranslations.col("itI18nId"), MdI18nPageSlug.col("ipsSlugId")])
    .whereIn(MdI18nTranslations.col("itType"), typesOfTranslationsRetrieve);

  const instancePageWideQb = utPageWideQb(instanceId).join(MdGroupDetails.TABLE_NAME, (qbJoin) => {
    qbJoin.on(MdGroupDetails.col("gEntityId"), MdI18nPageOverride.col("ipoInstanceId"));
  });
  const appPageWideQb = utPageWideQb();
  return qb.select(utGetI18nInstanceMultipleImpTranslationsQb(trx, defaultTranslationQb, {
    appPageWideQb, instancePageWideQb, instanceWideQb, lShortName,
  }));
};

export const other = "";
