// @ts-nocheck
import { tpI18nExtractor, tpSludges } from "../types/tpI18n";
import { dtTransInternalEmails } from "../../i18n/data/slugTranslations/dtTransInternalEmails";
import { LANGUAGE_TR } from "../../src/module/shared/data/dtI18nLanguages";

export const getSludgesAsObject = (allSludges): tpSludges => allSludges.reduce((
  accum, v,
) => ({ ...accum, [v]: v }), {}) as tpSludges;

export const utI18n = (data: any): tpI18nExtractor => (module, page, slug, defaultText = "") => {
  if (data && data[module] && data[module][page] && data[module][page][slug]) {
    return (data[module] && data[module][page] && data[module][page][slug]) || defaultText;
  }
  return defaultText;
};

export const utI18nInternalEmails = (slug: string, lang: string): string => {
  const langKey = lang === LANGUAGE_TR ? "tr" : "en";
  return dtTransInternalEmails[slug][langKey];
};
