import { Request, Response, NextFunction } from "express";
import { QueryBuilder, Raw, Transaction } from "knex";
import MdI18n from "./mdMultiInstI18n";
import { TI18nGetTranslationQueryParam, TI18nUpdateMultiInstTranslationData, tpI18nUpdateMultiInstTransformData } from "../../shared/types/tpI18n";
import ModuleDao from "../../privilege/module/doModule";
import {
  COL_IS_DYNAMIC_ALIAS, COL_IS_HAS_MULTIPLE_IMP_ALIAS, COL_IS_OVERRIDDEN_ALIAS, COL_LOCKED_ALIAS, COL_SLG_LOCKED_STATUS,
  COL_SLG_TYPE_ALIAS, COL_TRANS_ROW_INST_ID, MODULE_TYPE_I18N, COL_TRANS_ROW_INST_NAME,
} from "../../shared/constants/dtI18nModuleConstants";
import DoPages from "../../pages/doPages";
import knex from "../../../base/database/cfgKnex";
import DoI18n from "./doMultiInstI18n";
import { utReadExcelFile } from "../../shared/utils/utExcel";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import MdGroupDetails from "../../entities/group/mdGroupDetails";
import MdI18nTranslations from "../../i18n/i18nTranslations/mdI18nTranslations";
import MdLanguages from "../../i18n/languages/mdLanguages";
import { LANGUAGE_EN } from "../../shared/data/dtI18nLanguages";
import { tpGetType } from "../../shared/types/tpShared";
import MdI18nInstanceOverride from "../../i18n/i18nInstanceOverride/mdI18nInstanceOverride";
import MdI18nPageOverride from "../../i18n/i18nPageOverride/mdI18nPageOverride";
import MdI18nPageSlug from "../../i18n/i18nPageSlug/mdI18nPageSlug";

const idCol = MdI18nTranslations.col("itId", false);
const textCol = MdI18nTranslations.col("itText", false);
const typeCol = MdI18nTranslations.col("itType", false);
const OvdTypeCol = MdI18nTranslations.col("itOverrideType", false);

const instanceSelectionCols = [
  COL_TRANS_ROW_INST_NAME, MdGroupDetails.col("gName"),
  COL_TRANS_ROW_INST_ID, MdGroupDetails.col("gEntityId"),
];
const translationsSelectionCols = [
  MdI18nTranslations.col("itText", false), MdI18nTranslations.col("itText"),
  MdI18nTranslations.col("itType", false), MdI18nTranslations.col("itType"),
  MdI18nTranslations.col("itId", false), MdI18nTranslations.col("itId"),
  MdI18nTranslations.col("itOverrideType", false), MdI18nTranslations.col("itOverrideType"),
];

export const getTransAndInstSelectionObjectQb = knex.client
  .raw("JSON_BUILD_OBJECT(?, ??, ?, ??, ?, ??, ?, ??, ?, ??, ?, ??)",
    [
      ...translationsSelectionCols,
      ...instanceSelectionCols,
    ]);

export const getTransSelectionObjectQb = knex.client.raw("JSON_BUILD_OBJECT(?, ??, ?, ??, ?, ??, ?, ??)",
  translationsSelectionCols);

export const utGetOverriddenOrDefaultTransForLangQb = (
  qbs: QueryBuilder, langId: string, typesOfTranslationsRetrieve: MdI18nTranslations["itType"][], selectInstCols: boolean,
): QueryBuilder => {
  qbs.distinctOn([MdI18nTranslations.col("itI18nId"), MdI18nTranslations.col("itLangId")]);
  const selectionObj = selectInstCols ? getTransAndInstSelectionObjectQb : getTransSelectionObjectQb;
  qbs.select(selectionObj);

  qbs.whereIn(MdI18nTranslations.col("itType"), typesOfTranslationsRetrieve);
  qbs.where(MdI18nTranslations.col("itLangId"), langId);

  return qbs;
};

export const utGetPageOverriddenOrDefaultTransForLangQb = (
  trx: Transaction, langId: string, alias: string, { typesOfTranslationsRetrieve }: {
    typesOfTranslationsRetrieve: MdI18nTranslations["itType"][],
  },
): QueryBuilder => {
  const qbs = trx(MdI18nTranslations.TABLE_NAME);
  qbs.leftJoin(MdI18nPageOverride.TABLE_NAME, (leftJoinQb) => (
    leftJoinQb.on(MdI18nPageOverride.col("ipoTranslationId"), MdI18nTranslations.col("itId"))
      .andOn(MdI18nPageOverride.col("ipoPageId"), MdI18nPageSlug.col("ipsPageId"))
      .andOnNull(MdI18nPageOverride.col("ipoInstanceId"))
  ));

  qbs.where(MdI18nTranslations.col("itI18nId"), qbs.client.raw("??", [MdI18nPageSlug.col("ipsSlugId")]));
  qbs.where((qbWhere) => (
    qbWhere.whereNotNull(MdI18nPageOverride.col("ipoId"))
      .orWhereNull(MdI18nTranslations.col("itOverrideType"))
  ));

  qbs.orderBy([MdI18nTranslations.col("itI18nId"), MdI18nTranslations.col("itLangId")]);
  qbs.orderByRaw("?? DESC NULLS LAST", [MdI18nPageOverride.col("ipoId")]);
  qbs.orderBy(MdI18nTranslations.col("itId"));

  return utGetOverriddenOrDefaultTransForLangQb(qbs, langId, typesOfTranslationsRetrieve, false);
};

export const utGetInstanceOverriddenOrDefaultTransForLangQb = (
  trx: Transaction, langId: string, alias: string, { typesOfTranslationsRetrieve, instanceId }: {
    instanceId: string, typesOfTranslationsRetrieve: MdI18nTranslations["itType"][],
  },
): QueryBuilder => {
  const qbs = trx(MdI18nTranslations.TABLE_NAME);

  qbs.leftJoin(MdI18nInstanceOverride.TABLE_NAME, (leftJoinQb) => (
    leftJoinQb.on(MdI18nInstanceOverride.col("iioTranslationId"), MdI18nTranslations.col("itId"))
      .andOn(MdI18nInstanceOverride.col("iioInstanceId"), trx.raw("?", instanceId))
  ));

  qbs.leftJoin(MdGroupDetails.TABLE_NAME, (leftJoinQb) => (
    leftJoinQb
      .on(MdI18nInstanceOverride.col("iioInstanceId"), MdGroupDetails.col("gEntityId"))
  ));

  qbs.where(MdI18nTranslations.col("itI18nId"), qbs.client.raw("??", [MdI18n.col("iId")]));
  qbs.where((qbWhere) => (
    qbWhere.whereNotNull(MdI18nInstanceOverride.col("iioId"))
      .orWhereNull(MdI18nTranslations.col("itOverrideType"))
  ));

  qbs.orderBy([MdI18nTranslations.col("itI18nId"), MdI18nTranslations.col("itLangId")]);
  qbs.orderByRaw("?? DESC NULLS LAST", [MdI18nInstanceOverride.col("iioId")]);
  qbs.orderBy(MdI18nTranslations.col("itId"));

  return utGetOverriddenOrDefaultTransForLangQb(qbs, langId, typesOfTranslationsRetrieve, true);
};

const utSelectOvAndInstanceColsFromRowsQb = (trx: Transaction, languages: MdLanguages[]) => {
  const ov = trx.raw(`
    (
      case 
        ${languages.map((lang) => (trx
    .raw("when (?? ->> ?) <> 'null' then true", [lang.lShortName, "itOverrideType"]))).join("\n")}
        else false
      end
    ) as ??
  `, [COL_IS_OVERRIDDEN_ALIAS]);

  const inst = trx.raw(`
    (
      case 
        ${languages.map((lang) => (trx
    .raw("when (?? ->> ?) <> 'null' then (?? ->> ?)",
      [lang.lShortName, COL_TRANS_ROW_INST_NAME, lang.lShortName, COL_TRANS_ROW_INST_NAME]))).join("\n")}
        else 'system'
      end
    ) as ??
  `, [COL_TRANS_ROW_INST_NAME]);

  const instId = trx.raw(`
    (
      case 
        ${languages.map((lang) => (trx
    .raw("when (?? ->> ?) <> 'null' then (?? ->> ?)",
      [lang.lShortName, COL_TRANS_ROW_INST_ID, lang.lShortName, COL_TRANS_ROW_INST_ID]))).join("\n")}
        else 'system'
      end
    ) as ??
  `, [COL_TRANS_ROW_INST_ID]);

  return [ov, inst, instId];
};

export const utI18nUnWrapLangObjectsFromRowsQb = (
  trx: Transaction, subQuery: QueryBuilder,
  { defaultColumns, languages }: { defaultColumns: (string | Raw)[], languages: MdLanguages[] },
  getOverriddenOnly = true,
): QueryBuilder => {
  const selection = [...defaultColumns];

  languages.forEach((lang) => {
    selection.push(
      trx.raw("(?? ->> ?)::uuid as ??", [lang.lShortName, idCol, `${lang.lShortName}Id`]),
      trx.raw("??->>? as ??", [lang.lShortName, textCol, `${lang.lShortName}`]),
      trx.raw("??->>? as ??", [lang.lShortName, typeCol, `${lang.lShortName}Type`]),
      trx.raw("??->>? as ??", [lang.lShortName, OvdTypeCol, `${lang.lShortName}OverrideType`]),
    );
  });

  const [ov, instance, instanceId] = utSelectOvAndInstanceColsFromRowsQb(trx, languages);
  selection.push(ov, instance, instanceId);

  const subQ = trx.raw("? as subQuery", [trx.raw(subQuery.toQuery()).wrap("(", ")")]);
  const qb = trx(subQ).select(selection);
  if (getOverriddenOnly) {
    qb.where((qbWhere) => (
      qbWhere.whereRaw(` ${languages.map((lang) => (trx
        .raw("(?? ->> ?) <> 'null' or", [lang.lShortName, COL_TRANS_ROW_INST_NAME]))).join("\n")} 
        ${(trx.raw(
        "(?? -> ?)::text = '??'",
        [
          LANGUAGE_EN, MdI18nTranslations.col("itType", false),
          tpGetType<MdI18nTranslations["itType"]>("dynamicNormal"),
        ],
      ) as unknown as string)}`)
    ));
  } else {
    qb.where((qbWhere) => (
      qbWhere.whereNotNull(trx.raw("?? -> ?", [LANGUAGE_EN, MdI18nTranslations.col("itId", false)]) as unknown as string)
        .orWhere(trx.raw(
          "(?? -> ?)::text = '??'",
          [
            LANGUAGE_EN, MdI18nTranslations.col("itType", false),
            tpGetType<MdI18nTranslations["itType"]>("dynamicNormal"),
          ],
        ) as unknown as string)
    ));
  }
  return qb;
};

export const utI18nInstanceTransAssignBooleanFlags = (
  trx: Transaction, qb: QueryBuilder, languagesModels: MdLanguages[], isDynamicTransType: boolean,
): void => {
  if (!isDynamicTransType) {
    const qbDynamicSelect = trx.raw(`
          case
            ${languagesModels.map(
    (lang) => trx.raw("when ?? ->> ? = ? then true", [lang.lShortName, "itType", "dynamicNormal"]),
  ).join("\n")} 
            else false
          end as ??
        `, [COL_IS_DYNAMIC_ALIAS]);

    const lockColSelect = trx.raw(
      "CASE WHEN ?? = ? THEN true ELSE false END as ??",
      [COL_SLG_TYPE_ALIAS, COL_SLG_LOCKED_STATUS, COL_LOCKED_ALIAS],
    );
    qb.select([qbDynamicSelect, lockColSelect]);
  } else {
    qb.select(trx.raw("true as ??", [COL_IS_DYNAMIC_ALIAS]));
    qb.select(trx.raw("false as ??", [COL_IS_HAS_MULTIPLE_IMP_ALIAS]));
    qb.select(trx.raw("false as ??", [COL_IS_OVERRIDDEN_ALIAS]));
    qb.select(trx.raw("true as ??", [COL_LOCKED_ALIAS]));
  }
};

export const utResolveQueryParamToPageId = async (
  trx: Transaction, { module, page }: TI18nGetTranslationQueryParam,
): Promise<string | undefined> => {
  if (module && page) {
    const moduleModel = await ModuleDao.findOneByPredicate(trx, {
      mModuleName: module, mModuleType: MODULE_TYPE_I18N,
    });
    const pageModel = moduleModel ? await DoPages.findOneByPredicate(trx, {
      pgName: page, pgModuleId: moduleModel.mModuleId,
    }) : undefined;

    return pageModel?.pgId;
  }
  return undefined;
};

export const utGetI18nDynamicTypeRecords = (
  unionQb: QueryBuilder, trx: Transaction, languages: MdLanguages[],
  { userPreferenceLanguage, pageId }: {
    userPreferenceLanguage: MdLanguages,
    pageId?: string
  },
): void => {
  const dynamicType = tpGetType<MdI18nTranslations["itType"]>("dynamicNormal");
  const unionQueryQb = DoI18n.getAllI18nDynamicRecords(unionQb, trx, userPreferenceLanguage, pageId);

  unionQueryQb.select(trx.raw("? as ??", ["0", COL_IS_HAS_MULTIPLE_IMP_ALIAS]));
  languages.forEach((language) => {
    unionQueryQb.select(trx.raw(
      "JSON_BUILD_OBJECT(?, ?) as ??", [
        MdI18nTranslations.col("itType", false), dynamicType, language.lShortName,
      ],
    ));
  });
};

export const utReadI18nUploadFile = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const excelFile = req.file;
    if (excelFile) {
      req.body = utReadExcelFile(excelFile, true, { headerIndex: 1 });
      next();
    } else {
      throw new MdUnprocessableEntityError("Please upload the excel file");
    }
  } catch (err) {
    next(err);
  }
};

type tpSeparateRecordByInstanceId = {
  filterNotHaveInstanceId: tpI18nUpdateMultiInstTransformData[],
  filterHaveInstanceId: tpI18nUpdateMultiInstTransformData[],
}

export const utSeparateRecordByInstanceId = (transformData: tpI18nUpdateMultiInstTransformData[]):
  tpSeparateRecordByInstanceId => {
  const filterHaveInstanceId = transformData.filter((item: TI18nUpdateMultiInstTranslationData) => item.instanceId);
  const filterNotHaveInstanceId = transformData.filter((item: TI18nUpdateMultiInstTranslationData) => !item.instanceId);
  return { filterNotHaveInstanceId, filterHaveInstanceId };
};
