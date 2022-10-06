import { Request, Response, NextFunction } from "express";
import { QueryBuilder, Raw, Transaction } from "knex";
import MdI18nPageSlug from "../i18nPageSlug/mdI18nPageSlug";
import MdI18nTranslations from "../i18nTranslations/mdI18nTranslations";
import MdI18nPageOverride from "../i18nPageOverride/mdI18nPageOverride";
import MdLanguages from "../languages/mdLanguages";
import { LANGUAGE_EN } from "../../shared/data/dtI18nLanguages";
import DoI18nTranslations from "../i18nTranslations/doI18nTranslations";
import { tpGetType } from "../../shared/types/tpShared";
import MdI18nInstanceOverride from "../i18nInstanceOverride/mdI18nInstanceOverride";
import MdI18n from "./mdI18n";
import { TI18nGetTranslationQueryParam } from "../../shared/types/tpI18n";
import ModuleDao from "../../privilege/module/doModule";
import {
  COL_IS_DYNAMIC_ALIAS, COL_IS_HAS_MULTIPLE_IMP_ALIAS, COL_IS_OVERRIDDEN_ALIAS, COL_LOCKED_ALIAS, COL_SLG_LOCKED_STATUS,
  COL_SLG_TYPE_ALIAS, MODULE_TYPE_I18N,
} from "../../shared/constants/dtI18nModuleConstants";
import DoPages from "../../pages/doPages";
import knex from "../../../base/database/cfgKnex";
import DoI18n from "./doI18n";
import { utReadExcelFile } from "../../shared/utils/utExcel";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";

const idCol = MdI18nTranslations.col("itId", false);
const textCol = MdI18nTranslations.col("itText", false);
const typeCol = MdI18nTranslations.col("itType", false);
const OvdTypeCol = MdI18nTranslations.col("itOverrideType", false);

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

export const getSelectionObjectQb = knex.client.raw("JSON_BUILD_OBJECT(?, ??, ?, ??, ?, ??, ?, ??)", [
  MdI18nTranslations.col("itText", false), MdI18nTranslations.col("itText"),
  MdI18nTranslations.col("itType", false), MdI18nTranslations.col("itType"),
  MdI18nTranslations.col("itId", false), MdI18nTranslations.col("itId"),
  MdI18nTranslations.col("itOverrideType", false), MdI18nTranslations.col("itOverrideType"),
]);

export const utGetOverriddenOrDefaultTransForLangQb = (
  qbs: QueryBuilder, langId: string, alias: string, typesOfTranslationsRetrieve: MdI18nTranslations["itType"][],
):QueryBuilder => {
  qbs.distinctOn([MdI18nTranslations.col("itI18nId"), MdI18nTranslations.col("itLangId")]);
  qbs.select(getSelectionObjectQb);

  qbs.whereIn(MdI18nTranslations.col("itType"), typesOfTranslationsRetrieve);
  qbs.where(MdI18nTranslations.col("itLangId"), langId);

  return qbs;
};

export const utGetPageOverriddenOrDefaultTransForLangQb = (
  trx: Transaction, langId: string, alias: string, { typesOfTranslationsRetrieve }:{
    typesOfTranslationsRetrieve: MdI18nTranslations["itType"][],
  },
):QueryBuilder => {
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

  return utGetOverriddenOrDefaultTransForLangQb(qbs, langId, alias, typesOfTranslationsRetrieve);
};

export const utGetInstanceOverriddenOrDefaultTransForLangQb = (
  trx: Transaction, langId: string, alias: string, { typesOfTranslationsRetrieve, instanceId }: {
    instanceId: string, typesOfTranslationsRetrieve: MdI18nTranslations["itType"][],
  },
):QueryBuilder => {
  const qbs = trx(MdI18nTranslations.TABLE_NAME);

  qbs.leftJoin(MdI18nInstanceOverride.TABLE_NAME, (leftJoinQb) => (
    leftJoinQb.on(MdI18nInstanceOverride.col("iioTranslationId"), MdI18nTranslations.col("itId"))
      .andOn(MdI18nInstanceOverride.col("iioInstanceId"), trx.raw("?", instanceId))
  ));

  qbs.where(MdI18nTranslations.col("itI18nId"), qbs.client.raw("??", [MdI18n.col("iId")]));
  qbs.where((qbWhere) => (
    qbWhere.whereNotNull(MdI18nInstanceOverride.col("iioId"))
      .orWhereNull(MdI18nTranslations.col("itOverrideType"))
  ));

  qbs.orderBy([MdI18nTranslations.col("itI18nId"), MdI18nTranslations.col("itLangId")]);
  qbs.orderByRaw("?? DESC NULLS LAST", [MdI18nInstanceOverride.col("iioId")]);
  qbs.orderBy(MdI18nTranslations.col("itId"));

  return utGetOverriddenOrDefaultTransForLangQb(qbs, langId, alias, typesOfTranslationsRetrieve);
};

export const utI18nUnWrapLangObjectsFromRowsQb = (
  trx: Transaction, subQuery: QueryBuilder,
  { defaultColumns, languages }: { defaultColumns: (string|Raw)[], languages: MdLanguages[] },
  rejectEmptyRows = true,
):QueryBuilder => {
  const selection = [...defaultColumns];

  languages.forEach((lang) => {
    selection.push(
      trx.raw("??->>? as ??", [lang.lShortName, idCol, `${lang.lShortName}Id`]),
      trx.raw("??->>? as ??", [lang.lShortName, textCol, `${lang.lShortName}`]),
      trx.raw("??->>? as ??", [lang.lShortName, typeCol, `${lang.lShortName}Type`]),
      trx.raw("??->>? as ??", [lang.lShortName, OvdTypeCol, `${lang.lShortName}OverrideType`]),
    );
  });

  const ov = trx.raw(`
    (
      case 
        ${languages.map((lang) => (trx
    .raw("when (?? ->> ?) <> 'null' then true", [lang.lShortName, "itOverrideType"]))).join("\n")}
        else false
      end
    ) as ??
  `, [COL_IS_OVERRIDDEN_ALIAS]);

  selection.push(ov);

  const subQ = trx.raw("? as subQuery", [trx.raw(subQuery.toQuery()).wrap("(", ")")]);
  const qb = trx(subQ).select(selection);
  if (rejectEmptyRows) {
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
):void => {
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

export const utI18nGetPageLevelTransIfExists = async (
  trx: Transaction, pageId: string, slugId: string, { langId, instanceId }: { langId: string, instanceId?: string|null },
):Promise<string|undefined> => {
  const pageOvdTrans = await DoI18nTranslations
    .getPageOverrideTranslationForSlug(trx, pageId, slugId, { langId, instanceId });
  return pageOvdTrans?.translationText?.length ? pageOvdTrans?.translationText : undefined;
};

export const utI18nGetInstanceLevelTransIfExists = async (
  trx: Transaction, pageId: string,
  { slugId, langId, instanceId }: { slugId: string, langId: string, instanceId: string|null },
):Promise<string|undefined> => {
  const pageOvdTrans = await DoI18nTranslations
    .getInstanceOverrideTranslationForSlug(trx, pageId, slugId, { langId, instanceId });
  return pageOvdTrans?.translationText?.length ? pageOvdTrans?.translationText : undefined;
};

export const utI18nGetDefaultTransIfExists = async (
  trx: Transaction, slugId: string, langId: string,
):Promise<string|undefined> => {
  const defaultTrans = await DoI18nTranslations.getDefaultTranslationForSlug(trx, slugId, langId, [
    tpGetType<MdI18nTranslations["itType"]>("staticMisc"),
    tpGetType<MdI18nTranslations["itType"]>("staticNormal"),
  ]);
  return defaultTrans?.translationText?.length ? defaultTrans.translationText : undefined;
};

export const utI18nGetLabelAsFallbackIfExists = async (
  trx: Transaction, slugId: string, langId: string,
):Promise<string|undefined> => {
  const label = await DoI18nTranslations.getDefaultTranslationForSlug(trx, slugId, langId, [
    tpGetType<MdI18nTranslations["itType"]>("label"),
  ]);
  return label?.translationText?.length ? label.translationText : undefined;
};

export const utI18nGetDefaultFallbackTransIfExists = async (
  trx: Transaction, slugId: string, defaultLang: MdLanguages,
):Promise<string|undefined> => {
  if (defaultLang) {
    const defaultFallback = await DoI18nTranslations
      .getDefaultTranslationForSlug(trx, slugId, defaultLang.lId as string, [
        tpGetType<MdI18nTranslations["itType"]>("staticMisc"),
        tpGetType<MdI18nTranslations["itType"]>("staticNormal"),
      ]);
    return defaultFallback?.translationText?.length ? defaultFallback.translationText : undefined;
  }
  return undefined;
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

export const utI18nInstanceMultipleImpTranslationsQb = (
  trx: Transaction, qb: QueryBuilder, {
    language, typesOfTranslationsRetrieve, instanceId,
  } :{
    language: MdLanguages, typesOfTranslationsRetrieve: MdI18nTranslations["itType"][], instanceId: string,
  },
):QueryBuilder => {
  const { lId, lShortName } = language;
  const utPageWideQb = (insId?: string) => trx(MdI18nTranslations.TABLE_NAME)
    .select(getSelectionObjectQb)
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
    .select(getSelectionObjectQb)
    .join(MdI18nInstanceOverride.TABLE_NAME, (qbJoin) => {
      qbJoin.on(MdI18nInstanceOverride.col("iioTranslationId"), MdI18nTranslations.col("itId"))
        .andOn(MdI18nInstanceOverride.col("iioInstanceId"), trx.raw("?", instanceId));
    })
    .where(MdI18nTranslations.col("itOverrideType"),
      tpGetType<MdI18nTranslations["itOverrideType"]>("stInstanceOverride"))
    .andWhereRaw("?? = ??", [MdI18nTranslations.col("itI18nId"), MdI18nPageSlug.col("ipsSlugId")])
    .andWhere(MdI18nTranslations.col("itLangId"), lId)
    .whereIn(MdI18nTranslations.col("itType"), typesOfTranslationsRetrieve);

  const defaultTranslationQb = trx(MdI18nTranslations.TABLE_NAME)
    .select(getSelectionObjectQb)
    .whereNull(MdI18nTranslations.col("itOverrideType"))
    .andWhere(MdI18nTranslations.col("itLangId"), lId)
    .andWhereRaw("?? = ??", [MdI18nTranslations.col("itI18nId"), MdI18nPageSlug.col("ipsSlugId")])
    .whereIn(MdI18nTranslations.col("itType"), typesOfTranslationsRetrieve);

  const instancePageWideQb = utPageWideQb(instanceId);
  const appPageWideQb = utPageWideQb();

  return qb.select(utGetI18nInstanceMultipleImpTranslationsQb(trx, defaultTranslationQb, {
    appPageWideQb, instancePageWideQb, instanceWideQb, lShortName,
  }));
};

export const utGetI18nDynamicTypeRecords = (
  unionQb: QueryBuilder, trx: Transaction, languages: MdLanguages[],
  { userPreferenceLanguage, pageId } :{
    userPreferenceLanguage: MdLanguages,
    pageId?: string
  },
):void => {
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
