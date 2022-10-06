import { JoinClause, QueryBuilder, Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdI18n from "./mdMultiInstI18n";
import { tpGetType } from "../../shared/types/tpShared";
import { LANGUAGE_EN, LANGUAGE_TR } from "../../shared/data/dtI18nLanguages";
import {
  utGetI18nDynamicTypeRecords, utGetInstanceOverriddenOrDefaultTransForLangQb,
  utI18nUnWrapLangObjectsFromRowsQb,
} from "./utMultiInstI18n";
import knexClient from "../../../base/database/cfgKnex";
import {
  COL_IS_DYNAMIC_ALIAS,
  COL_IS_HAS_MULTIPLE_IMP_ALIAS,
  COL_IS_OVERRIDDEN_ALIAS,
  COL_LOCKED_ALIAS, COL_SLG_ALIAS,
  COL_SLG_ID_ALIAS, COL_SLG_LOCKED_STATUS, COL_SLG_TYPE_ALIAS,
} from "../../shared/constants/dtI18nModuleConstants";
import MdLanguages from "../../i18n/languages/mdLanguages";
import MdI18nTranslations from "../../i18n/i18nTranslations/mdI18nTranslations";
import MdI18nPageSlug from "../../i18n/i18nPageSlug/mdI18nPageSlug";

const doGetAllTranslationLabelJoin = (
  trx: Transaction,
  qbTranslation: JoinClause,
  userPreferenceLanguage: MdLanguages,
) => (
  qbTranslation.on(MdI18nTranslations.col("itI18nId"), MdI18n.col("iId"))
    .andOn(MdI18nTranslations.col("itLangId"), trx.raw("?", [userPreferenceLanguage.lId as string]))
    .andOn(MdI18nTranslations.col("itType"), trx.raw("?", [tpGetType<MdI18nTranslations["itType"]>("label")]))
);

const doGetAllTranslationTranslationJoin = (
  trx: Transaction,
  qbTranslation: JoinClause,
  language: MdLanguages,
  { joinTblAlias, typesOfTranslationsRetrieve }: {
    joinTblAlias: string,
    typesOfTranslationsRetrieve: MdI18nTranslations["itType"][],
  },
) => {
  qbTranslation.on(trx.raw("??.?? = ??", [
    joinTblAlias, MdI18nTranslations.col("itI18nId", false), MdI18n.col("iId"),
  ]));
  qbTranslation.andOnIn(`${joinTblAlias}.${MdI18nTranslations.col("itType", false)}`,
    typesOfTranslationsRetrieve);
  qbTranslation.andOnNull(`${joinTblAlias}.${MdI18nTranslations.col("itOverrideType", false)}`);
  qbTranslation.andOn(`${joinTblAlias}.${MdI18nTranslations.col("itLangId", false)}`,
    trx.raw("?", [language.lId as string]));
};

const doGetAllTranslationLangTranslationSelection = (
  trx: Transaction,
  joinTblAlias: string,
) => [
  trx.raw(
    "??.?? as ??",
    [joinTblAlias, MdI18nTranslations.col("itId", false), `${joinTblAlias}Id`],
  ),
  trx.raw(
    "??.?? as ??",
    [joinTblAlias, MdI18nTranslations.col("itText", false), joinTblAlias],
  ),
  trx.raw(
    "??.?? as ??",
    [joinTblAlias, MdI18nTranslations.col("itType", false), `${joinTblAlias}Type`],
  ),
  trx.raw(
    "??.?? as ??",
    [joinTblAlias, MdI18nTranslations.col("itOverrideType", false), `${joinTblAlias}OverrideType`],
  ),
];

const doGetAllTranslationCheckMultipleImpSelection = (trx: Transaction) => {
  const qb = trx(MdI18nPageSlug.TABLE_NAME);
  qb.count("*");
  qb.whereRaw("?? = ??", [MdI18nPageSlug.col("ipsSlugId"), MdI18n.col("iId")]);
  qb.as(COL_IS_HAS_MULTIPLE_IMP_ALIAS);

  return qb;
};

const slugSelectionAlias = [
  knexClient.client.raw("?? as ??", [MdI18n.col("iId"), COL_SLG_ID_ALIAS]),
  knexClient.client.raw("?? as ??", [MdI18n.col("iSlug"), COL_SLG_ALIAS]),
  knexClient.client.raw("?? as ??", [MdI18n.col("iType"), COL_SLG_TYPE_ALIAS]),
];

const doGetDefaultTranslationQb = (
  trx: Transaction,
  tableName: string,
  userPreferenceLanguage: MdLanguages,
  multipleImpSelection = true,
): QueryBuilder => {
  const qb = trx(tableName)
    .select([
      ...slugSelectionAlias,
      trx.raw("?? as ??", [MdI18nTranslations.col("itText"), "label"]),
    ])
    .leftJoin(MdI18nTranslations.TABLE_NAME, (qb1) => doGetAllTranslationLabelJoin(trx, qb1, userPreferenceLanguage));

  if (multipleImpSelection) qb.select(doGetAllTranslationCheckMultipleImpSelection(trx));
  return qb;
};

class DoI18n extends DoBase<MdI18n> {
  constructor() {
    super(MdI18n.TABLE_NAME);
  }

  getAllI18nDynamicRecords(
    qb: QueryBuilder, trx: Transaction, userPreferenceLanguage: MdLanguages, pageId?: string,
  ): QueryBuilder {
    const allLabelsQb = trx(MdI18nTranslations.TABLE_NAME)
      .where(this.col("iId"), trx.raw("??", [MdI18nTranslations.col("itI18nId")]))
      .andWhere(MdI18nTranslations.col("itType"), tpGetType<MdI18nTranslations["itType"]>("label"))
      .andWhere(MdI18nTranslations.col("itLangId"), userPreferenceLanguage.lId);

    const qbOf = qb.from(MdI18n.TABLE_NAME)
      .distinctOn(MdI18n.col("iId"))
      .select([
        ...slugSelectionAlias,
        trx.raw(`(${allLabelsQb.select(MdI18nTranslations.col("itText"))}) as label`),
      ])
      .join(MdI18nTranslations.TABLE_NAME, MdI18n.col("iId"), MdI18nTranslations.col("itI18nId"))
      .where(MdI18nTranslations.col("itType"), tpGetType<MdI18nTranslations["itType"]>("dynamicNormal"));

    if (pageId) {
      qbOf.join(MdI18nPageSlug.TABLE_NAME, MdI18nPageSlug.col("ipsSlugId"), MdI18n.col("iId"))
        .where(MdI18nPageSlug.col("ipsPageId"), pageId);
    }

    return qbOf;
  }

  getAllTranslations(
    trx: Transaction,
    languages: MdLanguages[],
    userPreferenceLanguage: MdLanguages,
    typesOfTranslationsRetrieve: MdI18nTranslations["itType"][],
  ) {
    const qb = doGetDefaultTranslationQb(trx, this.tableName, userPreferenceLanguage);

    const defaultLanguages = [LANGUAGE_EN, LANGUAGE_TR];
    languages.forEach((language) => {
      const joinTblAlias = language.lShortName;
      const transQb = qb.select(doGetAllTranslationLangTranslationSelection(trx, joinTblAlias));
      const join = defaultLanguages.includes(language.lShortName) ? "join" : "leftJoin";

      transQb[join](
        qb.client.raw("?? as ??", [MdI18nTranslations.TABLE_NAME, joinTblAlias]),
        (qb1) => {
          doGetAllTranslationTranslationJoin(trx, qb1, language, {
            joinTblAlias, typesOfTranslationsRetrieve,
          });
          qb1.andOnNull(`${joinTblAlias}.${MdI18nTranslations.col("itOverrideType", false)}`);
        },
      );
    });

    qb.select(trx.raw("false as ??", [COL_IS_OVERRIDDEN_ALIAS]));
    qb.select(trx.raw("'system' as ??", ["instance"]));
    qb.select(trx.raw("'system' as ??", ["instanceId"]));
    qb.select(trx.raw("false as ??", [COL_IS_DYNAMIC_ALIAS]));

    const lockSelect = trx.raw(
      "CASE WHEN ?? = ? THEN true ELSE false END as ??",
      [MdI18n.col("iType"), COL_SLG_LOCKED_STATUS, COL_LOCKED_ALIAS],
    );
    qb.select(lockSelect);

    return qb;
  }

  getAllTranslationsForInstance(
    trx: Transaction,
    languages: MdLanguages[],
    userPreferenceLanguage: MdLanguages,
    { typesOfTranslationsRetrieve, instanceId, pageId }:
      { typesOfTranslationsRetrieve: MdI18nTranslations["itType"][], instanceId: string, pageId?: string },
  ) {
    const qb = doGetDefaultTranslationQb(trx, this.tableName, userPreferenceLanguage);

    if (pageId) {
      qb.join(MdI18nPageSlug.TABLE_NAME, MdI18nPageSlug.col("ipsSlugId"), MdI18n.col("iId"));
      qb.where(MdI18nPageSlug.col("ipsPageId"), pageId);
    }

    languages.forEach((language) => {
      const joinTblAlias = language.lShortName;
      const langTranslationQb = utGetInstanceOverriddenOrDefaultTransForLangQb(
        trx, language.lId as string, joinTblAlias,
        { typesOfTranslationsRetrieve, instanceId },
      );
      qb.select(trx.raw(`(${langTranslationQb.toQuery()}) ??`, [joinTblAlias]));
    });

    const isAllTypeTranslations = typesOfTranslationsRetrieve.length > 1;
    if ((pageId && isAllTypeTranslations)) {
      qb.unionAll((unionQb) => utGetI18nDynamicTypeRecords(
        unionQb, trx, languages, { userPreferenceLanguage, pageId },
      ));
    }

    return utI18nUnWrapLangObjectsFromRowsQb(trx, qb, {
      defaultColumns: [COL_SLG_ID_ALIAS, COL_SLG_ALIAS, COL_SLG_TYPE_ALIAS, "label", COL_IS_HAS_MULTIPLE_IMP_ALIAS],
      languages,
    });
  }
}

export default new DoI18n();
