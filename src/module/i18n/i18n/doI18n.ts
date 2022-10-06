import { JoinClause, QueryBuilder, Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdI18n from "./mdI18n";
import MdLanguages from "../languages/mdLanguages";
import MdI18nTranslations from "../i18nTranslations/mdI18nTranslations";
import { tpGetType } from "../../shared/types/tpShared";
import { LANGUAGE_EN, LANGUAGE_TR } from "../../shared/data/dtI18nLanguages";
import MdI18nPageSlug from "../i18nPageSlug/mdI18nPageSlug";
import MdPages from "../../pages/mdPages";
import MdModule from "../../privilege/module/mdModule";
import {
  utGetI18nDynamicTypeRecords, utGetInstanceOverriddenOrDefaultTransForLangQb, utGetPageOverriddenOrDefaultTransForLangQb,
  getSelectionObjectQb, utI18nInstanceMultipleImpTranslationsQb, utI18nUnWrapLangObjectsFromRowsQb,
} from "./utI18n";
import knexClient from "../../../base/database/cfgKnex";
import MdI18nDynamic from "../i18nDynamic/mdI18nDynamic";
import { TI18nUpdateTranslationData } from "../../shared/types/tpI18n";
import {
  COL_IS_HAS_MULTIPLE_IMP_ALIAS,
  COL_LOCKED_ALIAS, COL_SLG_ALIAS,
  COL_SLG_ID_ALIAS, COL_SLG_LOCKED_STATUS, COL_SLG_TYPE_ALIAS,
} from "../../shared/constants/dtI18nModuleConstants";

const doAppPageWideRecords = (
  trx: Transaction,
  qb: QueryBuilder,
  {
    languages, typesOfTranslationsRetrieve,
  }: {
    languages: MdLanguages[],
    typesOfTranslationsRetrieve: MdI18nTranslations["itType"][]
  },
) => {
  languages.forEach((language) => {
    const joinTblAlias = language.lShortName;
    const langTranslationQb = utGetPageOverriddenOrDefaultTransForLangQb(
      trx, language.lId as string, joinTblAlias, {
        typesOfTranslationsRetrieve,
      },
    );
    qb.select(trx.raw(`(${langTranslationQb.toQuery()}) ??`, [joinTblAlias]));
  });
};

const doInstancePageWideRecords = (
  trx: Transaction,
  qb: QueryBuilder,
  { languages, instanceId, typesOfTranslationsRetrieve }: {
    languages: MdLanguages[],
    instanceId: string,
    typesOfTranslationsRetrieve: MdI18nTranslations["itType"][]
  },
) => {
  languages.forEach((language) => {
    utI18nInstanceMultipleImpTranslationsQb(trx, qb, {
      language, instanceId, typesOfTranslationsRetrieve,
    });
  });
  return qb;
};

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
    if ((pageId && isAllTypeTranslations) || isAllTypeTranslations) {
      qb.unionAll((unionQb) => utGetI18nDynamicTypeRecords(
        unionQb, trx, languages, { userPreferenceLanguage, pageId },
      ));
    }

    return utI18nUnWrapLangObjectsFromRowsQb(trx, qb, {
      defaultColumns: [COL_SLG_ID_ALIAS, COL_SLG_ALIAS, COL_SLG_TYPE_ALIAS, "label", COL_IS_HAS_MULTIPLE_IMP_ALIAS],
      languages,
    });
  }

  getAllTranslationsForPage(
    trx: Transaction,
    languages: MdLanguages[],
    userPreferenceLanguage: MdLanguages,
    { typesOfTranslationsRetrieve, pageId }:
      { typesOfTranslationsRetrieve: MdI18nTranslations["itType"][], pageId: string, },
  ) {
    const qb = this.getAllTranslations(trx, languages, userPreferenceLanguage, typesOfTranslationsRetrieve);
    qb.join(MdI18nPageSlug.TABLE_NAME, MdI18nPageSlug.col("ipsSlugId"), MdI18n.col("iId"));
    qb.where(MdI18nPageSlug.col("ipsPageId"), pageId);
    return qb;
  }

  getMultipleImplementations(
    trx: Transaction,
    slugId: string,
    typesOfTranslationsRetrieve: MdI18nTranslations["itType"][],
    { languages, instanceId }: {
      languages: MdLanguages[], instanceId: string | null,
    },
  ): QueryBuilder {
    const qb = trx(MdI18nPageSlug.TABLE_NAME);
    const slugIdAlias = trx.raw("?? as ??", [MdI18nPageSlug.col("ipsSlugId", false), COL_SLG_ID_ALIAS]);
    const selectionCols = [
      MdI18nPageSlug.col("ipsId", false),
      MdModule.col("mModuleName", false),
      MdPages.col("pgName", false),
      MdPages.col("pgId", false),
    ];
    qb.select([...selectionCols, slugIdAlias])
      .join(MdPages.TABLE_NAME, MdPages.col("pgId"), MdI18nPageSlug.col("ipsPageId"))
      .join(MdModule.TABLE_NAME, MdModule.col("mModuleId"), MdPages.col("pgModuleId"));

    if (slugId !== "undefined") qb.where(MdI18nPageSlug.col("ipsSlugId"), slugId);

    let query = qb;
    if (instanceId) {
      query = doInstancePageWideRecords(trx, qb, {
        languages, instanceId, typesOfTranslationsRetrieve,
      });
    } else {
      doAppPageWideRecords(trx, qb, {
        languages, typesOfTranslationsRetrieve,
      });
    }
    return utI18nUnWrapLangObjectsFromRowsQb(trx, query,
      { defaultColumns: [...selectionCols, COL_SLG_ID_ALIAS], languages });
  }

  getDynamicTranslationsForSlug(
    trx: Transaction,
    qb: QueryBuilder,
    languages: MdLanguages[],
    {
      slugId, selectedInstanceId, type, pkIdKey, label,
    }: {
      slugId: string, selectedInstanceId: string, pkIdKey: string, label: string, type: MdI18nDynamic["idItemType"],
    },
  ): QueryBuilder {
    const keyId = tpGetType<keyof TI18nUpdateTranslationData>("dynamicItemId");
    const keyType = tpGetType<keyof TI18nUpdateTranslationData>("dynamicItemType");

    qb.select(trx.raw("?? as ??", [pkIdKey, keyId]));
    qb.select(trx.raw("? as ??", [type, keyType]));
    qb.select(trx.raw("? as ??", [label || "", "label"]));

    languages.forEach((language) => {
      const joinTblAlias = language.lShortName;
      const langTranslationQb = trx(MdI18nTranslations.TABLE_NAME)
        .select(getSelectionObjectQb)
        .join(MdI18nDynamic.TABLE_NAME, (qbJoin) => {
          qbJoin.on(MdI18nDynamic.col("idTranslationId"), MdI18nTranslations.col("itId"))
            .andOn(MdI18nDynamic.col("idItemId"), pkIdKey)
            .andOn(MdI18nDynamic.col("idItemType"), trx.raw("?", [type]));
        })
        .where(MdI18nTranslations.col("itLangId"), language.lId as string)
        .andWhere(MdI18nTranslations.col("itI18nId"), slugId)
        .andWhere(MdI18nDynamic.col("idInstanceId"), selectedInstanceId);
      qb.select(trx.raw(`(${langTranslationQb}) ??`, [joinTblAlias]));
    });

    return utI18nUnWrapLangObjectsFromRowsQb(trx, qb, {
      defaultColumns: [keyId, keyType, "label"], languages,
    }, false);
  }
}

export default new DoI18n();
