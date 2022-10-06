import { Transaction } from "knex";
import DoLanguages from "./doLanguages";
import { LANGUAGE_EN } from "../../shared/data/dtI18nLanguages";
import MdLanguages from "./mdLanguages";
import DoI18nInstance from "../i18nInstance/doI18nInstance";
import { UserSessionType } from "../../shared/types/tpShared";
import SrUserSelectedInstance from "../../user/userSelectedInstance/srUserSelectedInstance";

export const srGetDefaultLanguage = (
  trx: Transaction,
):Promise<MdLanguages> => DoLanguages.findOneByCol(trx, "lShortName", LANGUAGE_EN);

export const srGetAdminSelectedLangOrDefault = async (
  trx: Transaction,
  lang: string,
):Promise<MdLanguages> => {
  const language = await DoLanguages.findOneByCol(trx, "lShortName", lang);
  if (language?.lStatus !== "active") return srGetDefaultLanguage(trx);
  return language;
};

export const srGetSelectedInstanceLangOrDefault = async (
  trx: Transaction,
  instanceId: string,
  lang: string,
):Promise<MdLanguages> => {
  const language = await DoLanguages.findOneByCol(trx, "lShortName", lang);
  if (language?.lStatus !== "active") return srGetDefaultLanguage(trx);
  const instanceLanguage = await DoI18nInstance.findOneByPredicate(trx, {
    iiLanguageId: language.lId,
    iiInstanceId: instanceId,
  });
  if (instanceLanguage) {
    if (instanceLanguage.iiStatus !== "active") {
      return srGetDefaultLanguage(trx);
    }
  }
  return language;
};

export const srGetLanguageOrDefault = async (
  trx: Transaction,
  lang: string,
  instanceId?: string|null,
): Promise<MdLanguages> => {
  if (instanceId) return srGetSelectedInstanceLangOrDefault(trx, instanceId, lang);
  return srGetAdminSelectedLangOrDefault(trx, lang);
};

export const srGetAllLanguages = async (
  trx: Transaction, selectedInstanceId?: string|null, removeDisabled?: boolean,
):Promise<(MdLanguages&{ disabled?:boolean }
)[]> => {
  let languages:MdLanguages[] = [];

  if (!selectedInstanceId) {
    languages = await DoLanguages.getAll(trx);
  } else {
    languages = await DoLanguages.getAllActiveLanguages(trx);
    const instanceLangs = languages.map(async (lang) => {
      const i18nInstance = await DoI18nInstance.findOneByPredicate(trx, {
        iiInstanceId: selectedInstanceId,
        iiLanguageId: lang.lId,
      });
      if (i18nInstance) return ({ ...lang, lStatus: i18nInstance.iiStatus });
      return lang;
    });
    languages = await Promise.all(instanceLangs);
  }

  if (removeDisabled) {
    languages = languages.filter((lang) => lang.lStatus === "active");
  }

  languages = languages.map((lang) => ({ ...lang, disabled: lang.lShortName === LANGUAGE_EN }));

  return languages;
};

export const utGetLanguagesByUser = async (trx: Transaction, sessionUser: UserSessionType): Promise<MdLanguages[]> => {
  const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
    .getSelectedInstance(trx, sessionUser.uEntityId) || {};
  const activeLanguages = !usiSelectedInstanceEntityId
    ? await srGetAllLanguages(trx, undefined, true)
    : await srGetAllLanguages(trx, usiSelectedInstanceEntityId, true);
  return activeLanguages;
};
