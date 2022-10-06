// @ts-nocheck
import { dtI18nSchema } from "../data/dtI18n";
import { dtAllSludges } from "../data/dtSludges";
import { dtSlgInternalEmails } from "../data/slugs/dtSlugInternalEmails"
import MdI18nTranslations from "../../src/module/i18n/i18nTranslations/mdI18nTranslations";

export type tpI18nSchema = typeof dtI18nSchema;
export type tpSlugs = typeof dtAllSludges[number];
export type tpSlugsEmails = typeof dtSlgInternalEmails[number];

export type tpSludges = {[key in tpSlugs]: key};

export type tpI18nTranslation = {
  en: string,
  tr: string,
  labelEn?: string,
  labelTr?: string,
  type?: "active"|"locked",
  transType?: MdI18nTranslations["itType"],
  overrideType?: MdI18nTranslations["itOverrideType"]
};

export type tpTransType<T extends Readonly<Array<string>>> = Record<T[number], tpI18nTranslation>;

export type tpI18nExtractor = <
  M extends (keyof tpI18nSchema),
  P extends keyof tpI18nSchema[M],
  S extends tpI18nSchema[M][P][number]
  >(module: M, page: P, slug: S, defaultText?: string) => string
