import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdI18nPageSlug from "./mdI18nPageSlug";
import MdPages from "../../pages/mdPages";
import MdModule from "../../privilege/module/mdModule";
import { COL_SLG_ID_ALIAS } from "../../shared/constants/dtI18nModuleConstants";
import MdI18nTranslations from "../../i18n/i18nTranslations/mdI18nTranslations";
import MdLanguages from "../languages/mdLanguages";
import { utGetPageOverriddenOrDefaultTransForLangQb, utI18nUnWrapLangObjectsFromRowsQb } from "../multiInstI18n/utMultiInstI18n";
import { utI18nInstanceMultipleImpTranslationsQb } from "../i18nMultipleImplementation/utI18nMultipleImplementation";

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

class DoI18nPageSlug extends DoBase<MdI18nPageSlug> {
  constructor() {
    super(MdI18nPageSlug.TABLE_NAME);
  }

  getAllMultipleImplementations(
    trx: Transaction,
    slugId: string,
    typesOfTranslationsRetrieve: MdI18nTranslations["itType"][],
    { languages, instanceId }: {
      languages: MdLanguages[], instanceId: string | undefined,
    },
  ): QueryBuilder {
    const qb = trx(this.tableName);
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
      { defaultColumns: [...selectionCols, COL_SLG_ID_ALIAS], languages }, !!instanceId);
  }
}

export default new DoI18nPageSlug();
