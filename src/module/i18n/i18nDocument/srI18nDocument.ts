import { Request, Response } from "express";
import { Transaction } from "knex";
import { utGetExportableColumns } from "../../shared/utils/utData";
import SrGenerateDocument, { tpExcelDocFieldsConfig } from "../../shared/services/srGenerateDocument";
import { GridFilterStateType } from "../../shared/types/tpFilter";
import { DocumentTypeType, GenerateDocumentPrintColsDetailType, UserSessionType } from "../../shared/types/tpShared";
import { TI18nUpdateTranslationData, tpI18nUpdateTransformData, tpI18nUpdateTransformDataWithMultipleImp } from "../../shared/types/tpI18n";
import { utGetColumnsForExport } from "../../shared/utils/utExcel";
import {
  COL_TRANS_ROW_TYPE, COL_SLG_ID_ALIAS, COL_TRANS_ROW_OVERRIDE_TYPE, COL_TRANS_ROW_MODULE_NAME,
  COL_TRANS_ROW_PAGE_NAME, COL_TRANS_ROW_DYNAMIC_ITEM_TYPE, COL_TRANS_ROW_DYNAMIC_ITEM_ID,
  COL_TRANS_ROW_I18N_ROUTE, COL_TRANS_ROW_OVERRIDE_DD,
  COL_TRANS_ROW_OVERRIDE_L, COL_TRANS_ROW_OVERRIDE_MI, COL_TRANS_ROW_OVERRIDE_OV,
} from "../../shared/constants/dtI18nModuleConstants";
import MdLanguages from "../languages/mdLanguages";
import { utGetLanguagesByUser } from "../languages/utLanguages";

const srGetIKeysRowFor18nDocument = (
  updatedExports: GridFilterStateType["exports"],
): unknown | undefined => updatedExports?.columns.reduce(
  (accum, col) => ({ ...accum, [col.field]: [col.field] }),
  {}
);

export const srExportTranslations = async (
  req: Request,
  res: Response,
  exports: GridFilterStateType["exports"],
  { data, exportType, excelDocFieldConfigs }:
    {
      data: unknown[], exportType: DocumentTypeType,
      excelDocFieldConfigs: tpExcelDocFieldsConfig
    },
): Promise<void> => {
  const columns = utGetExportableColumns(exports);
  const bufferData = await SrGenerateDocument
    .generateDocumentByType(data, exportType, columns,
      {
        heading: exports?.title || "I18n Translations", dateDisplayFormat: "", excelDocFieldConfigs,
      });
  SrGenerateDocument.setAttachmentType(res, exports?.filename || "i18n-translations-list", exportType);
  res.send(bufferData);
};

export const srI18nExtendExportableColumns = (
  exports: GridFilterStateType["exports"],
  allAllActiveLanguages: MdLanguages[],
  data: Record<string, unknown>[],
  routeName: string,
): [Record<string, unknown>[], GridFilterStateType["exports"], unknown | undefined] => {
  const getLangData = allAllActiveLanguages.map((languageData) => [
    `${languageData.lShortName}Id`,
    `${languageData.lShortName + COL_TRANS_ROW_TYPE}`,
    `${languageData.lShortName + COL_TRANS_ROW_OVERRIDE_TYPE}`,
  ]);
  const exportableColumns = [...getLangData.flat(), COL_SLG_ID_ALIAS, COL_TRANS_ROW_I18N_ROUTE, COL_TRANS_ROW_OVERRIDE_DD,
    COL_TRANS_ROW_OVERRIDE_OV, COL_TRANS_ROW_OVERRIDE_L, COL_TRANS_ROW_OVERRIDE_MI];
  let updatedExports = utGetColumnsForExport(exports, exportableColumns);
  const removeDuplicates = updatedExports?.columns.reduce((acc: GenerateDocumentPrintColsDetailType[],
    col: GenerateDocumentPrintColsDetailType) => {
    if (acc.findIndex((item: GenerateDocumentPrintColsDetailType) => item.field === col.field) === -1) {
      acc.push(col);
    }
    return acc;
  }, []) as GenerateDocumentPrintColsDetailType[];
  if (updatedExports) updatedExports = { ...updatedExports, columns: removeDuplicates };
  const fieldKeysRows = srGetIKeysRowFor18nDocument(updatedExports);
  const updatedData = data.map((item) => ({ ...item, i18nRouteName: routeName }));
  return [updatedData, updatedExports, fieldKeysRows];
};

export const srI18nDynamicExtendExportableColumns = (
  exports: GridFilterStateType["exports"],
  allAllActiveLanguages: MdLanguages[],
): [GridFilterStateType["exports"], unknown | undefined] => {
  const getLangData = allAllActiveLanguages.map((languageData) => [
    `${languageData.lShortName}Id`,
    `${languageData.lShortName + COL_TRANS_ROW_TYPE}`,
    `${languageData.lShortName + COL_TRANS_ROW_OVERRIDE_TYPE}`,
  ]);
  const exportableColumns = [
    ...getLangData.flat(),
    COL_SLG_ID_ALIAS,
    COL_TRANS_ROW_DYNAMIC_ITEM_TYPE,
    COL_TRANS_ROW_DYNAMIC_ITEM_ID,
    COL_TRANS_ROW_I18N_ROUTE,
  ];
  const updatedExports = utGetColumnsForExport(exports, exportableColumns);
  const fieldKeysRows = srGetIKeysRowFor18nDocument(updatedExports);
  return [updatedExports, fieldKeysRows];
};

export const srI18nTransformDataFromUploadedFile = async (
  trx: Transaction,
  req: Request,
  sessionUser: UserSessionType,
): Promise<tpI18nUpdateTransformData[]> => {
  const activeLanguages = await utGetLanguagesByUser(trx, sessionUser);
  const i18nFileData = req.body;
  const hiddenColumns = activeLanguages.map((language) => ({
    name: language.lFullName,
    langId: `${language.lShortName}Id`,
    langShortName: language.lShortName,
  }));
  const transformData: tpI18nUpdateTransformDataWithMultipleImp[] = [];
  for (let i = 0; i < i18nFileData.length; i += 1) {
    for (let j = 0; j < hiddenColumns.length; j += 1) {
      const { langShortName } = hiddenColumns[j];
      const obj: tpI18nUpdateTransformDataWithMultipleImp = {
        translationId: i18nFileData[i][hiddenColumns[j].langId],
        translationValue: i18nFileData[i][hiddenColumns[j].langShortName],
        slugId: i18nFileData[i][COL_SLG_ID_ALIAS],
        transRowType: i18nFileData[i][`${langShortName + COL_TRANS_ROW_TYPE}`]
          ? i18nFileData[i][`${langShortName + COL_TRANS_ROW_TYPE}`] : "staticNormal",
        transRowOvdType: i18nFileData[i][`${langShortName + COL_TRANS_ROW_OVERRIDE_TYPE}`]
          ? i18nFileData[i][`${langShortName + COL_TRANS_ROW_OVERRIDE_TYPE}`] : null,
        language: langShortName,
        mModuleName: i18nFileData[i][COL_TRANS_ROW_MODULE_NAME],
        pgName: i18nFileData[i][COL_TRANS_ROW_PAGE_NAME],
      };
      transformData.push(obj);
    }
  }
  return transformData.filter((data) => (data.slugId && data.translationValue !== undefined));
};

export const srI18nDynamicTransformDataFromUploadedFile = async (
  trx: Transaction,
  req: Request,
  sessionUser: UserSessionType,
): Promise<TI18nUpdateTranslationData[]> => {
  const activeLanguages = await utGetLanguagesByUser(trx, sessionUser);
  const i18nFileData = req.body;
  const hiddenColumns = activeLanguages.map((language) => ({
    name: language.lFullName,
    langId: `${language.lShortName}Id`,
    langShortName: language.lShortName,
  }));
  const transformData: TI18nUpdateTranslationData[] = [];
  for (let i = 0; i < i18nFileData.length; i += 1) {
    for (let j = 0; j < hiddenColumns.length; j += 1) {
      const { langShortName } = hiddenColumns[j];
      const obj: TI18nUpdateTranslationData = {
        translationId: i18nFileData[i][hiddenColumns[j].langId],
        translationValue: i18nFileData[i][hiddenColumns[j].langShortName],
        slugId: i18nFileData[i][COL_SLG_ID_ALIAS],
        transRowType: i18nFileData[i][`${langShortName + COL_TRANS_ROW_TYPE}`]
          ? i18nFileData[i][`${langShortName + COL_TRANS_ROW_TYPE}`] : "staticNormal",
        transRowOvdType: i18nFileData[i][`${langShortName + COL_TRANS_ROW_OVERRIDE_TYPE}`]
          ? i18nFileData[i][`${langShortName + COL_TRANS_ROW_OVERRIDE_TYPE}`] : null,
        language: langShortName,
        dynamicItemType: i18nFileData[i][COL_TRANS_ROW_DYNAMIC_ITEM_TYPE],
        dynamicItemId: i18nFileData[i][COL_TRANS_ROW_DYNAMIC_ITEM_ID],
      };
      transformData.push(obj);
    }
  }
  return transformData.filter((data) => (data.slugId && data.translationValue !== undefined));
};
