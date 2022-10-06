import { Transaction } from "knex";
import { DEFAULT_LANGUAGES } from "../../shared/data/dtI18nLanguages";
import { TI18nUpdateTranslationData } from "../../shared/types/tpI18n";
import {
  utI18nGetPageLevelTransIfExists, utI18nGetInstanceLevelTransIfExists,
  utI18nGetDefaultTransIfExists, utI18nGetDefaultFallbackTransIfExists,
  utI18nGetLabelAsFallbackIfExists,
} from "../i18n/utI18n";
import MdLanguages from "../languages/mdLanguages";
import doI18nTranslations from "./doI18nTranslations";

export const utUpdateTranslationToDatabase = async (trx: Transaction,
  data: TI18nUpdateTranslationData, itId: string): Promise<void> => {
  await doI18nTranslations.updateOneByPredicate(trx, { itText: data.translationValue }, {
    itId, itI18nId: data.slugId,
  });
};

export const utGetTranslationText = async (
  trx: Transaction,
  defaultLang: MdLanguages,
  {
    pageId, langId, instanceId, slugId, language,
  }: {
    pageId: string, langId: string, instanceId?: string | null, slugId: string, language: MdLanguages,
  },
): Promise<string | undefined> => {
  let transTxt = await utI18nGetPageLevelTransIfExists(trx, pageId, slugId, { langId, instanceId });
  if (instanceId && !transTxt) {
    transTxt = await utI18nGetInstanceLevelTransIfExists(trx, pageId, { slugId, langId, instanceId });
    if (!transTxt) transTxt = await utI18nGetPageLevelTransIfExists(trx, pageId, slugId, { langId, instanceId: null });
  }
  if (!transTxt) transTxt = await utI18nGetDefaultTransIfExists(trx, slugId, langId);
  if (!transTxt) transTxt = await utI18nGetDefaultFallbackTransIfExists(trx, slugId, defaultLang);
  if (!transTxt) {
    const langIdOrDefaultLangId = DEFAULT_LANGUAGES.includes(language.lShortName) ? language.lId : defaultLang?.lId;
    transTxt = await utI18nGetLabelAsFallbackIfExists(trx, slugId, langIdOrDefaultLangId as string);
  }

  return transTxt;
};
