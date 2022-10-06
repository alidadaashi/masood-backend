import { Transaction } from "knex";
import doModule from "../../src/module/privilege/module/doModule";
import doPages from "../../src/module/pages/doPages";
import doI18n from "../../src/module/i18n/i18n/doI18n";
import doI18nPageSlug from "../../src/module/i18n/i18nPageSlug/doI18nPageSlug";
import doI18nTranslations from "../../src/module/i18n/i18nTranslations/doI18nTranslations";
import MdI18nTranslations from "../../src/module/i18n/i18nTranslations/mdI18nTranslations";
import doLanguages from "../../src/module/i18n/languages/doLanguages";
import { MODULE_TYPE_I18N } from "../../src/module/shared/constants/dtI18nModuleConstants";
import mdPages from "../../src/module/pages/mdPages";
import { dtAllTranslations, dtI18nSchema } from "../data/dtI18n";
import MdUnprocessableEntityError from "../../src/base/errors/mdUnprocessableEntityError";
import { tpI18nTranslation } from "../types/tpI18n";

export const combineAllI18nAndTranslations = (i18nSchema: any, i18nTranslation: any) => {
  const finalData: any = [];
  const modules = Object.keys(i18nSchema);
  modules.forEach((module) => {
    const pages = Object.keys(i18nSchema[module]);
    pages.forEach((page) => {
      const sludges = i18nSchema[module][page] as string[];
      sludges.forEach((slug) => {
        const data = {
          module, page, slug, translation: i18nTranslation[slug],
        };
        finalData.push(data);
      });
    });
  });

  return finalData;
};

const addTranslationRecord = async (
  trx: Transaction,
  enId: string,
  trId: string,
  slugId: string,
  translation: tpI18nTranslation,
) => {
  const transType = translation.transType || "staticNormal";
  const ovdType = translation.overrideType || null;
  const labelEn = translation.labelEn || translation.en;
  const labelTr = translation.labelTr || translation.tr;

  const enLabelForSlug:MdI18nTranslations = {
    itLangId: enId, itType: "label", itText: labelEn, itI18nId: slugId, itOverrideType: ovdType,
  };
  const enTranslationForSlug:MdI18nTranslations = {
    itLangId: enId, itType: transType, itText: translation.en, itI18nId: slugId, itOverrideType: ovdType,
  };
  const trLabelForSlug:MdI18nTranslations = {
    itLangId: trId, itType: "label", itText: labelTr, itI18nId: slugId, itOverrideType: ovdType,
  };
  const trTranslationForSlug:MdI18nTranslations = {
    itLangId: trId, itType: transType, itText: translation.tr, itI18nId: slugId, itOverrideType: ovdType,
  };
  await doI18nTranslations.insertMany(trx, [
    enLabelForSlug, enTranslationForSlug, trLabelForSlug, trTranslationForSlug,
  ]);
};

export const insertSlugAndPageSlug = async (
  trx: Transaction,
  i18nTranslations: any,
) => {
  const allInsertableI18n = i18nTranslations.map(async (i18n: any) => {
    const {
      module, page, slug, translation,
    } = i18n;
    const mdModule = await doModule.findOneByCol(trx, "mModuleName", module);
    const mdPage = await doPages.findOneByPredicate(trx, { pgModuleId: mdModule.mModuleId, pgName: page });

    const i18nType = translation.type || "active";
    const [mdSlug] = await doI18n.upsertMany(trx, { iSlug: slug, iType: i18nType }, ["iSlug"]);
    await doI18nPageSlug.upsertMany(trx, { ipsPageId: mdPage.pgId, ipsSlugId: mdSlug.iId }, ["ipsPageId", "ipsSlugId"]);
  });
  return Promise.all(allInsertableI18n);
};

export const insertI18nTransInDb = async (
  trx: Transaction,
  i18nTranslations: any,
  enId: string,
  trId: string,
) => {
  const uniqueTranslations:Record<string, any> = i18nTranslations
    .reduce((accum:any, trans:any) => ({ ...accum, [trans.slug]: trans.translation }), {});
  const allInsertableI18nTrans = Object.entries(uniqueTranslations).map(async ([slug, translation]) => {
    const mdSlug = await doI18n.findOneByCol(trx, "iSlug", slug);
    if (mdSlug) {
      await addTranslationRecord(trx, enId, trId, mdSlug.iId as string, translation);
    } else throw new MdUnprocessableEntityError(`Cannot find slug "${slug}"`);
  });

  return Promise.all(allInsertableI18nTrans);
};

const getLanguagesTemp = async (trx: Transaction) => {
  const [en] = await doLanguages.insertOne(trx, { lShortName: "En", lFullName: "English", lStatus: "active" });
  const [tr] = await doLanguages.insertOne(trx, { lShortName: "Tr", lFullName: "Turkish", lStatus: "active" });

  return { enId: en.lId as string, trId: tr.lId as string };
};

const insertModulesAndPages = async (trx: Transaction, i18nTranslations: any) => {
  const mp:any = { };
  i18nTranslations.forEach((trans: any) => {
    const pages = mp[trans.module] || [];
    mp[trans.module] = [...new Set([...pages, trans.page])];
  });
  const insertableModulePages = Object.keys(mp).map(async (module) => {
    const [moduleModel] = await doModule.insertOne(trx, { mModuleName: module, mModuleType: MODULE_TYPE_I18N });
    const pagesModels:mdPages[] = mp[module].map((page: string) => ({ pgModuleId: moduleModel.mModuleId, pgName: page }));
    await doPages.insertMany(trx, pagesModels);
  });
  await Promise.all(insertableModulePages);
};

export const buildAndInsertTranslations = async (trx: Transaction) => {
  const i18nSchema = dtI18nSchema;
  const i18nTranslation = dtAllTranslations;

  const { enId, trId } = await getLanguagesTemp(trx);
  const combinedI18n = combineAllI18nAndTranslations(i18nSchema, i18nTranslation);
  await insertModulesAndPages(trx, combinedI18n);
  await insertSlugAndPageSlug(trx, combinedI18n);
  await insertI18nTransInDb(trx, combinedI18n, enId, trId);
};
