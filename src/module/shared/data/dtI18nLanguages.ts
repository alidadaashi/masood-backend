import MdLanguages from "../../i18n/languages/mdLanguages";

export const LANGUAGE_EN = "En";
export const LANGUAGE_TR = "Tr";

export const i18nLanguagesData:MdLanguages[] = [
  { lShortName: LANGUAGE_EN, lFullName: "English", lStatus: "active" },
  { lShortName: LANGUAGE_TR, lFullName: "Turkish", lStatus: "active" },
];

export const DEFAULT_LANGUAGES = [LANGUAGE_EN, LANGUAGE_TR];
