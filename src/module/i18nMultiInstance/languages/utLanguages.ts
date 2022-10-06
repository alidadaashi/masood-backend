import { Transaction } from "knex";
import DoLanguages from "./doLanguages";
import { LANGUAGE_EN } from "../../shared/data/dtI18nLanguages";
import MdLanguages from "./mdLanguages";
import DoI18nInstance from "../../i18n/i18nInstance/doI18nInstance";
import { UserSessionType } from "../../shared/types/tpShared";
import { utGetSelectedInstanceIds } from "../../../routes/utAclHelper";
import SrUserPreferences from "../../preferences/userPreference/srUserPreferences";

export const srGetDefaultLanguage = (
  trx: Transaction,
): Promise<MdLanguages> => DoLanguages.findOneByCol(trx, "lShortName", LANGUAGE_EN);

export const srGetUserPrefLangOrDefault = async (
  trx: Transaction,
  uEntityId: string,
): Promise<MdLanguages> => {
  const userLangPref = await SrUserPreferences.getUserPreferenceByType(trx, uEntityId, "language");
  const userLang = userLangPref ? userLangPref.upValue as string : LANGUAGE_EN;
  const language = await DoLanguages.findOneByCol(trx, "lShortName", userLang);
  if (language?.lStatus !== "active") return srGetDefaultLanguage(trx);
  return language;
};

export const srGetAllLanguages = async (
  trx: Transaction, selectedInstanceIds?: string[] | null, removeDisabled?: boolean,
): Promise<(MdLanguages & { disabled?: boolean }
)[]> => {
  let languages: MdLanguages[] = [];

  if (!selectedInstanceIds) {
    languages = await DoLanguages.getAll(trx);
  } else {
    languages = await DoLanguages.getAllActiveLanguages(trx);
    selectedInstanceIds.forEach(async (instId) => {
      const instanceLangs = languages.map(async (lang) => {
        const i18nInstance = await DoI18nInstance.findOneByPredicate(trx, {
          iiInstanceId: instId,
          iiLanguageId: lang.lId,
        });
        if (i18nInstance) return ({ ...lang, lStatus: i18nInstance.iiStatus });
        return lang;
      });
      languages = { ...languages, ...await Promise.all(instanceLangs) };
    });
  }

  if (removeDisabled) {
    languages = languages.filter((lang) => lang.lStatus === "active");
  }

  languages = languages.map((lang) => ({ ...lang, disabled: lang.lShortName === LANGUAGE_EN }));
  return languages;
};

export const utGetLanguagesByUser = async (trx: Transaction, sessionUser: UserSessionType): Promise<MdLanguages[]> => {
  const userInstances = utGetSelectedInstanceIds(sessionUser.userInstances);
  const activeLanguages = userInstances.length > 0
    ? await srGetAllLanguages(trx, userInstances, true)
    : await srGetAllLanguages(trx, undefined, true);
  return activeLanguages;
};
