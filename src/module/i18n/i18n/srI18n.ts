import { QueryBuilder, Transaction } from "knex";
import DoLanguages from "../languages/doLanguages";
import DoI18n from "./doI18n";
import { DEFAULT_LANGUAGES, LANGUAGE_EN } from "../../shared/data/dtI18nLanguages";
import MdLanguages from "../languages/mdLanguages";
import MdI18nTranslations from "../i18nTranslations/mdI18nTranslations";
import {
  TI18nTransScreenText, TI18nUpdateTranslationData, TI18nUpdateTranslationMultipleImp,
} from "../../shared/types/tpI18n";
import DoI18nTranslations from "../i18nTranslations/doI18nTranslations";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { utBroadcastTranslateUpdateNotificationToAll } from "../../shared/utils/utSession";
import { srBuildFilterCriteria } from "../../shared/services/filters/srFilter";
import { FilterCheckFnType, GridFilterStateType } from "../../shared/types/tpFilter";
import { utCountTotalByQb } from "../../shared/utils/utData";
import DoI18nPageOverride from "../i18nPageOverride/doI18nPageOverride";
import {
  utResolveQueryParamToPageId, utI18nInstanceTransAssignBooleanFlags,
} from "./utI18n";
import DoI18nPageSlug from "../i18nPageSlug/doI18nPageSlug";
import DoI18nInstanceOverride from "../i18nInstanceOverride/doI18nInstanceOverride";
import MdProduct from "../../product/mdProduct";
import DoI18nDynamic from "../i18nDynamic/doI18nDynamic";
import { tpGetType } from "../../shared/types/tpShared";
import { srGetAllLanguages, srGetDefaultLanguage, srGetLanguageOrDefault } from "../languages/utLanguages";
import { COL_IS_DYNAMIC_ALIAS, COL_IS_OVERRIDDEN_ALIAS } from "../../shared/constants/dtI18nModuleConstants";
import knex from "../../../base/database/cfgKnex";
import { utGetTranslationText, utUpdateTranslationToDatabase } from "../i18nTranslations/utI18nTranslations";
import { utGetAllDataIdsArray } from "../../shared/utils/utFilter";
import { srAddTranslationMultipleImp } from "../i18nMultipleImplementation/sri18nMultipleImplementation";

type I18nResponseType = Record<string, unknown>;

const srAddTranslationOverriddenRecord = async (
  trx: Transaction, pageId: string, languageModel: MdLanguages, { data, instanceId }: {
    data: TI18nUpdateTranslationData, instanceId: string | null
  },
) => {
  const { translationValue, slugId, transRowType } = data;
  const itOverrideType = "stPageOverride";
  const [translationModel] = await DoI18nTranslations.insertOne(trx, {
    itText: translationValue, itI18nId: slugId, itLangId: languageModel.lId, itType: transRowType, itOverrideType,
  });

  await DoI18nPageOverride.insertOne(trx, {
    ipoPageId: pageId, ipoTranslationId: translationModel.itId, ipoInstanceId: instanceId,
  });
};

const srGetFilteredQb = async (
  trx: Transaction, qb: QueryBuilder,
  { filters, dbRowId }: { filters: GridFilterStateType, dbRowId: string },
  ct?: FilterCheckFnType,
) => {
  const isSelectAllRows = (filters.isSelectAllRows as unknown as string === "true");
  const allIds = isSelectAllRows ? await utGetAllDataIdsArray(trx, qb, dbRowId) : [];
  const wrappedQbInSubQueryForFilters = knex.select("*").from(qb.as("SUBQ"));
  const qbWithFilters = srBuildFilterCriteria(wrappedQbInSubQueryForFilters, filters, ct, false);
  const data = await qbWithFilters;
  const total = data.length ? await utCountTotalByQb(qbWithFilters) : 0;

  return { data, total, allIds };
};

class SrI18n {
  static async getAllInstanceTranslations(
    trx: Transaction, transType: MdI18nTranslations["itType"], filters: GridFilterStateType, {
      language, pageId, selectedInstanceId,
    }: { language: string, pageId?: string, selectedInstanceId: string },
  ): Promise<[Promise<{ data: I18nResponseType[]; total: number; allIds: string[] }>, (MdLanguages & {
    disabled?: boolean | undefined;
  })[]]> {
    const languagesModels = await srGetAllLanguages(trx, selectedInstanceId, true);
    const selectedLang = DEFAULT_LANGUAGES.includes(language) ? language : LANGUAGE_EN;
    const userPreferenceLanguage = await srGetLanguageOrDefault(trx, selectedLang, selectedInstanceId);
    const typesOfTranslationsRetrieve: (typeof transType)[] = transType ? [transType] : ["staticNormal", "staticMisc"];

    const isDynamicTransType = transType === "dynamicNormal";
    const qb = isDynamicTransType
      ? DoI18n.getAllI18nDynamicRecords(trx.queryBuilder(), trx, userPreferenceLanguage, pageId)
      : DoI18n.getAllTranslationsForInstance(trx, languagesModels, userPreferenceLanguage as MdLanguages,
        { typesOfTranslationsRetrieve, instanceId: selectedInstanceId, pageId });

    utI18nInstanceTransAssignBooleanFlags(trx, qb, languagesModels, isDynamicTransType);

    const langs = languagesModels.map((lang) => lang.lShortName);
    const srOmitFilterAndSortForLanguagesColumns = (field: string) => {
      if (langs.includes(field)) return undefined;
      return field;
    };
    return [srGetFilteredQb(trx, qb,
      { filters, dbRowId: "slugId" }, isDynamicTransType ? srOmitFilterAndSortForLanguagesColumns : undefined),
    languagesModels];
  }

  static async getAllTranslations(
    trx: Transaction,
    transType: MdI18nTranslations["itType"],
    { pageId, filters, language }: { filters: GridFilterStateType, language: string, pageId?: string },
  ): Promise<[Promise<{ data: I18nResponseType[]; total: number; allIds: string[] }>, (MdLanguages & {
    disabled?: boolean | undefined;
  })[]]> {
    const languagesModels = await srGetAllLanguages(trx, undefined, true);
    const selectedLang = DEFAULT_LANGUAGES.includes(language) ? language : LANGUAGE_EN;
    const userPreferenceLanguage = await srGetLanguageOrDefault(trx, selectedLang, null);
    const typesOfTranslationsRetrieve: (typeof transType)[] = transType ? [transType] : ["staticNormal", "staticMisc"];
    const qb = pageId ? DoI18n.getAllTranslationsForPage(trx, languagesModels, userPreferenceLanguage,
      { typesOfTranslationsRetrieve, pageId: pageId as string })
      : DoI18n.getAllTranslations(trx, languagesModels, userPreferenceLanguage, typesOfTranslationsRetrieve);

    qb.select(trx.raw("false as ??", [COL_IS_DYNAMIC_ALIAS]));
    qb.select(trx.raw("false as ??", [COL_IS_OVERRIDDEN_ALIAS]));
    return [srGetFilteredQb(trx, qb, { filters, dbRowId: "slugId" }), languagesModels];
  }

  static async updateTranslations(
    trx: Transaction, translationData: TI18nUpdateTranslationData[],
  ): Promise<void> {
    const updatableTranslations = translationData.map(async (data) => {
      if (data.translationId) {
        await utUpdateTranslationToDatabase(trx, data, data.translationId);
      } else {
        const languageModel = await DoLanguages.findOneByCol(trx, "lShortName", data.language);
        if (!languageModel) throw new MdUnprocessableEntityError(`The language "${data.language}" does not exists!`);
        const translations = await DoI18nTranslations.findOneByPredicate(trx, {
          itI18nId: data.slugId, itLangId: languageModel.lId, itType: data.transRowType,
        });
        if (translations && translations.itId) {
          await utUpdateTranslationToDatabase(trx, data, translations.itId);
        } else {
          await DoI18nTranslations.insertOne(trx, {
            itText: data.translationValue, itI18nId: data.slugId, itLangId: languageModel.lId, itType: data.transRowType,
          });
        }
      }
    });

    await Promise.all(updatableTranslations); utBroadcastTranslateUpdateNotificationToAll();
  }

  static async updateTranslationsForInstance(
    trx: Transaction, instanceId: string, translationData: TI18nUpdateTranslationData[],
  ): Promise<void> {
    const updatableTranslations = translationData.map(async (data) => {
      if (data.translationId && data.transRowOvdType === "stInstanceOverride") {
        await DoI18nTranslations.updateOneByPredicate(trx, { itText: data.translationValue }, {
          itId: data.translationId, itI18nId: data.slugId,
        });
      } else {
        const languageModel = await DoLanguages.findOneByCol(trx, "lShortName", data.language);
        if (!languageModel
          || !languageModel.lId) throw new MdUnprocessableEntityError(`The language "${data.language}" does not exists!`);
        const translations = await DoI18nTranslations
          .getInstanceOverrideTranslationForSlug(trx, "", data.slugId, {
            langId: languageModel.lId,
            instanceId,
          });
        if (translations && translations.translationId) {
          await utUpdateTranslationToDatabase(trx, data, translations.translationId);
        } else {
          const itOverrideType = "stInstanceOverride";
          const [translationModel] = await DoI18nTranslations.insertOne(trx, {
            itText: data.translationValue,
            itI18nId: data.slugId,
            itLangId: languageModel.lId,
            itType: data.transRowType,
            itOverrideType,
          });
          await DoI18nInstanceOverride.insertOne(trx, {
            iioInstanceId: instanceId, iioTranslationId: translationModel.itId,
          });
        }
      }
    });
    await Promise.all(updatableTranslations); utBroadcastTranslateUpdateNotificationToAll();
  }

  static async updateMultipleImpTranslationForSingle(
    trx: Transaction, translationData: TI18nUpdateTranslationData[],
    params: { module: string, page: string, instanceId: string | null }, broadcast = true,
  ): Promise<void> {
    const pageId = await utResolveQueryParamToPageId(trx, params);
    if (!pageId) throw new MdUnprocessableEntityError(`The page "${params.page}" does not exists`);
    const updatableTranslations = translationData.map(async (data) => {
      const languageModel = await DoLanguages.findOneByCol(trx, "lShortName", data.language);
      if (!languageModel
        || !languageModel.lId) throw new MdUnprocessableEntityError(`The language "${data.language}" does not exists!`);
      const translations = await DoI18nTranslations.getPageOverrideTranslationForSlug(trx, pageId, data.slugId,
        { langId: languageModel.lId, instanceId: params.instanceId });
      const translationId = translations?.translationId ? translations?.translationId : data.translationId;
      if (translationId) {
        const pageOverridden = await DoI18nPageOverride.findOneByPredicate(trx, {
          ipoTranslationId: translationId, ipoPageId: pageId, ipoInstanceId: params.instanceId,
        });

        if (!pageOverridden) {
          await srAddTranslationOverriddenRecord(trx, pageId, languageModel, { data, instanceId: params.instanceId });
        } else {
          await DoI18nTranslations.updateOneByPredicate(trx, { itText: data.translationValue }, {
            itId: translationId, itI18nId: data.slugId, itType: data.transRowType, itOverrideType: "stPageOverride",
          });
        }
      } else {
        await srAddTranslationMultipleImp(trx, pageId, params.instanceId, data);
      }
    });

    await Promise.all(updatableTranslations);
    if (broadcast) utBroadcastTranslateUpdateNotificationToAll();
  }

  static async updateMultipleImpTranslationsBulk(
    trx: Transaction, translationData: TI18nUpdateTranslationMultipleImp[], slugId: string, instanceId: string | null,
  ): Promise<void> {
    const updatableData = translationData.map(({
      mModuleName, pgName, ...translation
    }) => SrI18n.updateMultipleImpTranslationForSingle(
      trx, [{ ...translation, slugId }], { module: mModuleName, page: pgName, instanceId }, false,
    ));

    await Promise.all(updatableData);
  }

  static async updateDynamicTranslationsForSlug(
    trx: Transaction, translationData: TI18nUpdateTranslationData[], slugId: string, instanceId: string,
  ): Promise<void> {
    const updatableTranslations = translationData.map(async (data) => {
      const languageModel = await DoLanguages.findOneByCol(trx, "lShortName", data.language);
      if (!languageModel
        || !languageModel.lId) throw new MdUnprocessableEntityError(`The language "${data.language}" does not exists!`);
      const translations = await DoI18nTranslations
        .getDynamicTranslationForSlug(trx, slugId, { langId: languageModel.lId, itemId: data.dynamicItemId, instanceId }, [
          tpGetType<MdI18nTranslations["itType"]>("dynamicNormal"),
        ]);
      const translationId = translations?.translationId ? translations?.translationId : data.translationId;
      if (translationId) {
        await DoI18nTranslations.updateOneByPredicate(trx, { itText: data.translationValue }, {
          itI18nId: slugId, itId: translationId,
        });
      } else {
        const itType = tpGetType<MdI18nTranslations["itType"]>("dynamicNormal");
        const [translationModel] = await DoI18nTranslations.insertOne(trx, {
          itText: data.translationValue, itI18nId: slugId, itLangId: languageModel.lId, itType,
        });
        const idInstanceId = instanceId;
        await DoI18nDynamic.insertOne(trx, {
          idItemId: data.dynamicItemId,
          idItemType: data.dynamicItemType,
          idTranslationId: translationModel.itId,
          idInstanceId,
        });
      }
    });

    await Promise.all(updatableTranslations);
    utBroadcastTranslateUpdateNotificationToAll();
  }

  static async getMultipleImplementations(
    trx: Transaction, slugId: string, filters: GridFilterStateType,
    { selectedInstanceId }: { selectedInstanceId: string | null },
  ): Promise<{ data: I18nResponseType[], total: number, allIds: string[] }> {
    const languagesModels = await srGetAllLanguages(trx, selectedInstanceId, true);
    const qb = DoI18n.getMultipleImplementations(
      trx, slugId, ["staticNormal", "staticMisc"], { languages: languagesModels, instanceId: selectedInstanceId },
    );

    return srGetFilteredQb(trx, qb, { filters, dbRowId: "ipsId" });
  }

  static async getScreenText(
    trx: Transaction, lang: string = LANGUAGE_EN, instanceId?: string | null,
  ): Promise<TI18nTransScreenText> {
    const language = await srGetLanguageOrDefault(trx, lang, instanceId);
    const langId = language.lId as string;
    const defaultLang = await srGetDefaultLanguage(trx);

    const pagesSlug = await DoI18nPageSlug.getPageSlugDetails(trx);
    const translations: TI18nTransScreenText = {};

    const translationsPromises = pagesSlug.map(async ({
      slugId, slugName, pageId, pageName, moduleName,
    }) => {
      let translationText = await utGetTranslationText(trx, defaultLang, {
        pageId, slugId, langId, instanceId: instanceId || null, language,
      });

      if (!translationText) translationText = slugName;

      if (!translations[moduleName]) translations[moduleName] = {};
      if (!translations[moduleName][pageName]) translations[moduleName][pageName] = {};

      translations[moduleName][pageName][slugName] = translationText;
    });

    await Promise.all(translationsPromises);
    return translations;
  }

  static async getDynamicTranslationsForSlug(
    trx: Transaction, language: string = LANGUAGE_EN, { slugId, filters, selectedInstanceId }: {
      slugId: string, filters: GridFilterStateType, selectedInstanceId: string
    },
  ): Promise<{ data: Pick<MdLanguages, "lShortName">[], total: number, allIds: string[] }> {
    const languagesModels = await srGetAllLanguages(trx, selectedInstanceId, true);
    const userPreferenceLanguage = await srGetLanguageOrDefault(trx, language, null);

    const productsQb = trx(MdProduct.TABLE_NAME);
    let label = await DoI18nTranslations.findOneByPredicate(trx, {
      itI18nId: slugId, itLangId: userPreferenceLanguage.lId as string, itType: "label",
    });
    if (!label) {
      const defaultLang = await DoLanguages.findOneByCol(trx, "lShortName", LANGUAGE_EN);
      label = await DoI18nTranslations.findOneByPredicate(trx, {
        itI18nId: slugId, itLangId: defaultLang.lId as string, itType: "label",
      });
    }
    const qb = DoI18n.getDynamicTranslationsForSlug(trx, productsQb, languagesModels, {
      slugId, selectedInstanceId, pkIdKey: MdProduct.col("pId"), type: "product", label: label?.itText || "",
    });

    return srGetFilteredQb(trx, qb, { filters, dbRowId: "dynamicItemId" });
  }
}

export default SrI18n;
