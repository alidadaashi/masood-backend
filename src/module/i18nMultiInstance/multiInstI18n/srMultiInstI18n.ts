import { QueryBuilder, Transaction } from "knex";
import DoI18n from "./doMultiInstI18n";
import { srBuildFilterCriteria } from "../../shared/services/filters/srFilter";
import { FilterCheckFnType, GridFilterStateType } from "../../shared/types/tpFilter";
import { utCountTotalByQb } from "../../shared/utils/utData";
import {
  utI18nInstanceTransAssignBooleanFlags, utResolveQueryParamToPageId,
} from "./utMultiInstI18n";
import knex from "../../../base/database/cfgKnex";
import MdLanguages from "../../i18n/languages/mdLanguages";
import MdI18nTranslations from "../../i18n/i18nTranslations/mdI18nTranslations";
import { srGetAllLanguages, srGetUserPrefLangOrDefault } from "../languages/utLanguages";
import doI18nTranslations from "../../i18n/i18nTranslations/doI18nTranslations";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import {
  TI18nUpdateMultiInstTranslationData, TI18nUpdateTranslationData,
  TI18nUpdateTranslationMultipleImp, tpI18nUpdateMultiInstTransformData,
} from "../../shared/types/tpI18n";
import { utBroadcastTranslateUpdateNotificationToAll } from "../../shared/utils/utSession";
import doI18nInstanceOverride from "../../i18n/i18nInstanceOverride/doI18nInstanceOverride";
import doLanguages from "../languages/doLanguages";
import doI18nPageSlug from "../i18nPageSlug/doI18nPageSlug";
import doI18nPageOverride from "../../i18n/i18nPageOverride/doI18nPageOverride";
import { utUpdateTranslationToDatabase } from "../../i18n/i18nTranslations/utI18nTranslations";

type I18nResponseType = Record<string, unknown>;

const srGetFilteredQb = async (qb: QueryBuilder, filters: GridFilterStateType, ct?: FilterCheckFnType) => {
  const wrappedQbInSubQueryForFilters = knex.select("*").from(qb.as("SUBQ"));
  const qbWithFilters = srBuildFilterCriteria(wrappedQbInSubQueryForFilters, filters, ct, false);
  const data = await qbWithFilters;
  const total = data.length ? await utCountTotalByQb(qbWithFilters) : 0;

  return { data, total };
};

const srAddTranslationOverriddenRecord = async (
  trx: Transaction, pageId: string, languageModel: MdLanguages, { data, instanceId }: {
    data: TI18nUpdateTranslationData, instanceId: string | null
  },
) => {
  const pageOvdTrans = await doI18nTranslations.getPageOverrideTranslationForSlug(trx, pageId, data.slugId,
    { langId: languageModel.lId ?? "", instanceId });
  if (!pageOvdTrans) {
    const { translationValue, slugId, transRowType } = data;
    const itOverrideType = "stPageOverride";
    const [translationModel] = await doI18nTranslations.insertOne(trx, {
      itText: translationValue, itI18nId: slugId, itLangId: languageModel.lId, itType: transRowType, itOverrideType,
    });
    await doI18nPageOverride.insertOne(trx, {
      ipoPageId: pageId, ipoTranslationId: translationModel.itId, ipoInstanceId: instanceId,
    });
  } else if (pageOvdTrans.translationId) {
    await doI18nTranslations.updateOneByPredicate(trx, { itText: data.translationValue }, {
      itId: pageOvdTrans.translationId, itI18nId: data.slugId, itType: data.transRowType, itOverrideType: "stPageOverride",
    });
  }
};

const srAddTranslationMultipleImp = async (
  trx: Transaction, pageId: string, instanceId: string | null, data: TI18nUpdateTranslationData,
) => {
  const languageModel = await doLanguages.findOneByCol(trx, "lShortName", data.language);
  if (!languageModel) throw new MdUnprocessableEntityError(`The language "${data.language}" does not exists!`);
  const { translationValue, slugId, transRowType } = data;
  const itOverrideType = "stPageOverride";
  const [translationModel] = await doI18nTranslations.insertOne(trx, {
    itText: translationValue, itI18nId: slugId, itLangId: languageModel.lId, itType: transRowType, itOverrideType,
  });

  await doI18nPageOverride.insertOne(trx, {
    ipoPageId: pageId, ipoTranslationId: translationModel.itId, ipoInstanceId: instanceId,
  });
};

const srGetMultiInstanceOverridenTranslations = (
  trx: Transaction, transType: MdI18nTranslations["itType"], userPreferenceLanguage: MdLanguages, {
    languagesModels, pageId, selectedInstanceIds,
  }: {
    languagesModels: (MdLanguages & {
      disabled?: boolean | undefined;
    })[], pageId?: string, selectedInstanceIds: string[]
  },
): QueryBuilder => {
  const typesOfTranslationsRetrieve: (typeof transType)[] = transType ? [transType] : ["staticNormal", "staticMisc"];

  const allInstanceQb = trx.queryBuilder();
  selectedInstanceIds.forEach((instanceId) => {
    const qbSingleInstance = DoI18n.getAllTranslationsForInstance(
      trx, languagesModels, userPreferenceLanguage as MdLanguages,
      { typesOfTranslationsRetrieve, instanceId, pageId },
    );
    utI18nInstanceTransAssignBooleanFlags(trx, qbSingleInstance, languagesModels, false);
    allInstanceQb.unionAll(qbSingleInstance);
  });

  return allInstanceQb;
};

class SrI18n {
  static async getAllSystemTranslations(
    trx: Transaction,
    transType: MdI18nTranslations["itType"],
    { filters, uEntityId }: { filters: GridFilterStateType, uEntityId: string, pageId?: string },
  ): Promise<[Promise<{ data: I18nResponseType[]; total: number; }>, (MdLanguages & {
    disabled?: boolean | undefined;
  })[]]> {
    const languagesModels = await srGetAllLanguages(trx, undefined, true);
    const userPreferenceLanguage = await srGetUserPrefLangOrDefault(trx, uEntityId);
    const typesOfTranslationsRetrieve: (typeof transType)[] = transType ? [transType] : ["staticNormal", "staticMisc"];
    const qb = DoI18n.getAllTranslations(trx, languagesModels, userPreferenceLanguage, typesOfTranslationsRetrieve);

    return [srGetFilteredQb(qb, filters), languagesModels];
  }

  static async getAllDynamicTranslations(trx: Transaction, userPreferenceLanguage: MdLanguages,
    { pageId, filters }: {
      filters: GridFilterStateType, pageId?: string
    }): Promise<[Promise<{ data: I18nResponseType[]; total: number; }>, (MdLanguages & {
      disabled?: boolean | undefined;
    })[]]> {
    const languagesModels = await srGetAllLanguages(trx, undefined, true);
    const allDynamicTransQb = DoI18n.getAllI18nDynamicRecords(trx.queryBuilder(), trx, userPreferenceLanguage, pageId);

    utI18nInstanceTransAssignBooleanFlags(trx, allDynamicTransQb, languagesModels, true);

    const langs = languagesModels.map((lang) => lang.lShortName);
    const srOmitFilterAndSortForLanguagesColumns = (field: string) => {
      if (langs.includes(field)) return undefined;
      return field;
    };

    return [srGetFilteredQb(allDynamicTransQb, filters, srOmitFilterAndSortForLanguagesColumns),
      languagesModels];
  }

  static async getAllMultiInstanceTranslations(
    trx: Transaction, transType: MdI18nTranslations["itType"], filters: GridFilterStateType, {
      pageId, uEntityId, selectedInstanceIds,
    }: { pageId?: string, uEntityId: string, selectedInstanceIds: string[] },
  ): Promise<[Promise<{ data: I18nResponseType[]; total: number; }>, (MdLanguages & {
    disabled?: boolean | undefined;
  })[]]> {
    const languagesModels = await srGetAllLanguages(trx, selectedInstanceIds, true);
    const userPreferenceLanguage = await srGetUserPrefLangOrDefault(trx, uEntityId);
    const typesOfTranslationsRetrieve: (typeof transType)[] = transType ? [transType] : ["staticNormal", "staticMisc"];

    if (transType === "dynamicNormal") {
      return SrI18n.getAllDynamicTranslations(trx, userPreferenceLanguage, { pageId, filters });
    }
    const allTransQb = srGetMultiInstanceOverridenTranslations(trx, transType, userPreferenceLanguage as MdLanguages, {
      languagesModels, pageId, selectedInstanceIds,
    });
    const qbSystemTrans = DoI18n.getAllTranslations(trx, languagesModels,
      userPreferenceLanguage, typesOfTranslationsRetrieve);
    allTransQb.unionAll(qbSystemTrans);

    return [srGetFilteredQb(allTransQb, filters, undefined), languagesModels];
  }

  static async updateTranslations(
    trx: Transaction, translationData: TI18nUpdateTranslationData[],
  ): Promise<void> {
    const updatableTranslations = translationData.map(async (data) => {
      if (data.translationId) {
        await utUpdateTranslationToDatabase(trx, data, data.translationId);
      } else {
        const languageModel = await doLanguages.findOneByCol(trx, "lShortName", data.language);
        if (!languageModel) throw new MdUnprocessableEntityError(`The language "${data.language}" does not exists!`);
        const translations = await doI18nTranslations.findOneByPredicate(trx, {
          itI18nId: data.slugId, itLangId: languageModel.lId, itType: data.transRowType,
        });
        if (translations && translations.itId) {
          await utUpdateTranslationToDatabase(trx, data, translations.itId);
        } else {
          await doI18nTranslations.insertOne(trx, {
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
        await doI18nTranslations.updateOneByPredicate(trx, { itText: data.translationValue }, {
          itId: data.translationId, itI18nId: data.slugId,
        });
      } else {
        const languageModel = await doLanguages.findOneByCol(trx, "lShortName", data.language);
        if (!languageModel
          || !languageModel.lId) throw new MdUnprocessableEntityError(`The language "${data.language}" does not exists!`);
        const translations = await doI18nTranslations
          .getInstanceOverrideTranslationForSlug(trx, "", data.slugId, {
            langId: languageModel.lId,
            instanceId,
          });
        if (translations && translations.translationId) {
          await utUpdateTranslationToDatabase(trx, data, translations.translationId);
        } else {
          const itOverrideType = "stInstanceOverride";
          const [translationModel] = await doI18nTranslations.insertOne(trx, {
            itText: data.translationValue,
            itI18nId: data.slugId,
            itLangId: languageModel.lId,
            itType: data.transRowType,
            itOverrideType,
          });
          await doI18nInstanceOverride.insertOne(trx, {
            iioInstanceId: instanceId, iioTranslationId: translationModel.itId,
          });
        }
      }
    });
    await Promise.all(updatableTranslations); utBroadcastTranslateUpdateNotificationToAll();
  }

  static async getInstancesMultiImplementations(
    trx: Transaction, slugId: string, filters: GridFilterStateType,
    selectedInstances: string[],
  ): Promise<{ data: I18nResponseType[], total: number }> {
    const languagesModels = await srGetAllLanguages(trx, selectedInstances, true);
    let getMultiImpQb = trx.queryBuilder();
    const systemAllMultiImpQb = doI18nPageSlug.getAllMultipleImplementations(
      trx, slugId, ["staticNormal", "staticMisc"], { languages: languagesModels, instanceId: undefined },
    );
    if (selectedInstances.length === 0) {
      getMultiImpQb = systemAllMultiImpQb;
    } else {
      selectedInstances.forEach((instanceId) => {
        const qbSingleInstMultiImp = doI18nPageSlug.getAllMultipleImplementations(
          trx, slugId, ["staticNormal", "staticMisc"], { languages: languagesModels, instanceId },
        );
        getMultiImpQb.unionAll(qbSingleInstMultiImp);
      });
      getMultiImpQb.unionAll(systemAllMultiImpQb);
    }
    return srGetFilteredQb(getMultiImpQb, filters);
  }

  static async updateInstancesMultipleImpTranslationsBulk(
    trx: Transaction, translationData: TI18nUpdateTranslationMultipleImp[], instanceId: string | null,
  ): Promise<void> {
    const updatableData = translationData.map(({
      mModuleName, pgName, ...translation
    }) => SrI18n.updateInstancesMultipleImpTranslationForSingle(
      trx, [{ ...translation }], { module: mModuleName, page: pgName, instanceId }, false,
    ));

    await Promise.all(updatableData);
    utBroadcastTranslateUpdateNotificationToAll();
  }

  static async updateInstancesMultipleImpTranslationForSingle(
    trx: Transaction, translationData: TI18nUpdateTranslationData[],
    params: { module: string, page: string, instanceId: string | null }, broadcast = true,
  ): Promise<void> {
    const pageId = await utResolveQueryParamToPageId(trx, params);
    if (!pageId) throw new MdUnprocessableEntityError(`The page "${params.page}" does not exists`);
    const updatableTranslations = translationData.map(async (data) => {
      const languageModel = await doLanguages.findOneByCol(trx, "lShortName", data.language);
      if (!languageModel
        || !languageModel.lId) throw new MdUnprocessableEntityError(`The language "${data.language}" does not exists!`);
      const translations = await doI18nTranslations.getPageOverrideTranslationForSlug(trx, pageId, data.slugId,
        { langId: languageModel.lId, instanceId: params.instanceId });
      const translationId = translations?.translationId ? translations?.translationId : data.translationId;
      if (translationId) {
        const pageOverridden = await doI18nPageOverride.findOneByPredicate(trx, {
          ipoTranslationId: translationId, ipoPageId: pageId, ipoInstanceId: params.instanceId,
        });

        if (!pageOverridden) {
          await srAddTranslationOverriddenRecord(trx, pageId, languageModel, { data, instanceId: params.instanceId });
        } else {
          await doI18nTranslations.updateOneByPredicate(trx, { itText: data.translationValue }, {
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
}

export const srUpdateInstanceMultipleImpHaveInstanceId = async (filterHaveInstanceId:
  tpI18nUpdateMultiInstTransformData[], trx: Transaction): Promise<void> => {
  const result = filterHaveInstanceId.reduce((acc: {
    [x: string]: TI18nUpdateMultiInstTranslationData[];
  },
  item: TI18nUpdateMultiInstTranslationData) => {
    acc[item.instanceId] = (acc[item.instanceId] || []);
    acc[item.instanceId].push(item);
    return acc;
  }, {});

  await Promise.all(Object.keys(result).map(
    (instanceEntityId) => SrI18n.updateInstancesMultipleImpTranslationsBulk(trx,
      result[instanceEntityId] as unknown as TI18nUpdateTranslationMultipleImp[], instanceEntityId || null),
  ));
};

export default SrI18n;
