import { Request, Response } from "express";
import { utGetExportableColumns } from "../../../module/shared/utils/utData";
import SrGenerateDocument, { tpExcelDocFieldsConfig } from "../../../module/shared/services/srGenerateDocument";
import { DocumentTypeType, GenerateDocumentPrintColsDetailType } from "../../../module/shared/types/tpShared";
import { GridFilterStateType } from "../../../module/shared/types/tpFilter";
import { tpCampaignDetailsRespData } from "../../../module/campaign/tpCampaign";
import { dtCampaignSupplierEditableFieldsSlug, dtCampaignVendorEditableFieldsSlug } from "../../../module/shared/data/dtCampaignFieldRecords";
import { I18N_DYNAMIC_ROUTE, I18N_MAIN_ROUTE, I18N_MP_ROUTE } from "../../../module/shared/constants/dtI18nModuleConstants";
import { dti18nLockCell, dti18nDynamicLockCell, dti18nMpLockCell } from "../../../module/i18n/i18n/dtI18n";

type tpDocumentGeneralConfig = {
  documentType?: DocumentTypeType,
  docTitle?: string,
  docFilename?: string
}

const utConvertNumberToLetterForExcelSheet = (index: number): string => {
  let alpha = "";
  let num: number = index;
  while (num > 0) {
    alpha = String.fromCharCode((((num - 1) % 26) + 65)) + alpha;
    num = Math.floor((num - 1) / 26);
  }
  return alpha;
};

const utGetHeaderCellsRange = (
  columns?: GenerateDocumentPrintColsDetailType[],
): string => {
  let headerRange = "";
  if (columns) {
    const columnsIndexes = columns.map((col) => col.orderIndex);
    const maxOrderIndex = Math.max(...columnsIndexes);
    const alphaMax = utConvertNumberToLetterForExcelSheet(maxOrderIndex + 1);
    headerRange = `A1:${alphaMax}1`;
  }
  return headerRange;
};

const utGetExcelAlpha = (
  colName: string,
  updatedExports: { title: string; filename: string; columns: GenerateDocumentPrintColsDetailType[]; } | undefined,
  campaignDetails: tpCampaignDetailsRespData,
): string => {
  let columnsIndex = updatedExports?.columns.findIndex((col) => col.field === colName);
  if (columnsIndex && colName !== "crId") columnsIndex += 1;
  let alpha = "";
  if (columnsIndex) {
    alpha = utConvertNumberToLetterForExcelSheet(columnsIndex);
  }
  if (columnsIndex === 0) alpha = "A";
  let test = "";
  campaignDetails.list.forEach((_, index) => {
    const num = index + 3;
    test = `${test + alpha + num}:`;
  });
  return test.slice(0, -1);
};

const utGetExcelAlphaForI18n = (
  colName: string,
  updatedExports: { title: string; filename: string; columns: GenerateDocumentPrintColsDetailType[]; } | undefined,
  i18nData: unknown[], route: string,
): string => {
  let columnsIndex = updatedExports?.columns.findIndex((col) => col.field === colName);

  if (route !== I18N_DYNAMIC_ROUTE && columnsIndex) columnsIndex += 1;

  let alpha = "";
  if (columnsIndex) {
    alpha = utConvertNumberToLetterForExcelSheet(columnsIndex);
  }
  if (columnsIndex === 0) alpha = "A";
  let test = "";
  i18nData.forEach((_, index) => {
    const num = index + 3;
    test = `${test + alpha + num}:`;
  });
  const allRange = test.slice(0, -1).split(":");
  return `${allRange[0]}:${allRange[allRange.length - 1]}`;
};

const utGetCampDetailsLockCellsRangeForVendor = (
  updatedExports: { title: string; filename: string; columns: GenerateDocumentPrintColsDetailType[]; } | undefined,
  campaignDetails: tpCampaignDetailsRespData,
): string[] => {
  const range: string[] = [];
  updatedExports?.columns.forEach((col) => {
    if (!dtCampaignVendorEditableFieldsSlug.includes(col.field)) {
      range.push(utGetExcelAlpha(col.field, updatedExports, campaignDetails));
    }
  });
  return [...range, utGetHeaderCellsRange(updatedExports?.columns)];
};

const utGetCampDetailsLockCellsRangeForSupplier = (
  updatedExports: { title: string; filename: string; columns: GenerateDocumentPrintColsDetailType[]; } | undefined,
  campaignDetails: tpCampaignDetailsRespData,
): string[] => {
  const range: string[] = [];
  updatedExports?.columns.forEach((col) => {
    if (!dtCampaignSupplierEditableFieldsSlug.includes(col.field)) {
      range.push(utGetExcelAlpha(col.field, updatedExports, campaignDetails));
    }
  });
  return [...range, utGetHeaderCellsRange(updatedExports?.columns)];
};

const utGetI18nLockCellsRangeForI18n = (
  updatedExports: { title: string; filename: string; columns: GenerateDocumentPrintColsDetailType[]; } | undefined,
  i18nData: unknown[], route: string,
): string[] => {
  const range: string[] = [];
  let hiddenColumns: string[];
  if (route === I18N_MAIN_ROUTE) {
    hiddenColumns = dti18nLockCell;
  } else if (route === I18N_DYNAMIC_ROUTE) {
    hiddenColumns = dti18nDynamicLockCell;
  } else if (route === I18N_MP_ROUTE) {
    hiddenColumns = dti18nMpLockCell;
  }
  updatedExports?.columns.forEach((col) => {
    if (col.orderIndex !== -1) {
      if (hiddenColumns.find((colName) => colName === col.field)) {
        range.push(utGetExcelAlphaForI18n(col.field, updatedExports, i18nData, route));
      }
    }
  });
  return [...range, utGetHeaderCellsRange(updatedExports?.columns)];
};

export const utGetCampDetailsExcelFieldsConfigs = (
  updatedExports: { title: string; filename: string; columns: GenerateDocumentPrintColsDetailType[]; } | undefined,
  campaignDetails: tpCampaignDetailsRespData,
): tpExcelDocFieldsConfig => ({
  lockCells: utGetCampDetailsLockCellsRangeForVendor(updatedExports, campaignDetails),
  comboFieldCells: [{
    range: utGetExcelAlpha("frm__lbl__category_comment", updatedExports, campaignDetails),
    fields: ["Onayla, Reddet, Revize İste"],
  }, {
    range: utGetExcelAlpha("frm__lbl__hero_evaluation_result", updatedExports, campaignDetails),
    fields: ["Uygun, Uygun değil"],
  }],
  customHeaderStyles: {
    columns: updatedExports?.columns.filter((col) => !!dtCampaignVendorEditableFieldsSlug.includes(col.field)),
    style: {
      fill: { type: "pattern", fgColor: "#fc8403", patternType: "solid" },
    },
  },
}) as tpExcelDocFieldsConfig;

export const utGetCampDetailsExcelFieldsConfigsForSupplier = (
  updatedExports: { title: string; filename: string; columns: GenerateDocumentPrintColsDetailType[]; } | undefined,
  campaignDetails: tpCampaignDetailsRespData,
): tpExcelDocFieldsConfig => ({
  lockCells: utGetCampDetailsLockCellsRangeForSupplier(updatedExports, campaignDetails),
  comboFieldCells: [{
    range: utGetExcelAlpha("frm__lbl__suggestion", updatedExports, campaignDetails),
    fields: ["Evet, Hayır"],
  }, {
    range: utGetExcelAlpha("frm__lbl__campaign_participation", updatedExports, campaignDetails),
    fields: ["Evet, Hayır"],
  }, {
    range: utGetExcelAlpha("frm__lbl__discount_type", updatedExports, campaignDetails),
    fields: ["Oransal, Tutar"],
  }],
  customHeaderStyles: {
    columns: updatedExports?.columns.filter((col) => !!dtCampaignSupplierEditableFieldsSlug.includes(col.field)),
    style: {
      fill: { type: "pattern", fgColor: "#4dacfa", patternType: "solid" },
    },
  },
}) as tpExcelDocFieldsConfig;

export const utGetCampDetailsExcelFieldsConfigsForI18n = (
  updatedExports: { title: string; filename: string; columns: GenerateDocumentPrintColsDetailType[]; } | undefined,
  i18nData: unknown[],
  route:string,
): tpExcelDocFieldsConfig => ({
  lockCells: utGetI18nLockCellsRangeForI18n(updatedExports, i18nData, route),
}) as tpExcelDocFieldsConfig;

export const utSendExportDocument = async <T = unknown>(
  res: Response,
  data: T[],
  exports: GridFilterStateType["exports"],
  { prefNumFormat, excelDocFieldConfigs, docConfigs }: {
    prefNumFormat?: string, excelDocFieldConfigs?: tpExcelDocFieldsConfig, docConfigs?: tpDocumentGeneralConfig
  },
): Promise<void> => {
  const colsToExport = utGetExportableColumns(exports);
  const documentType = docConfigs?.documentType || "xls";
  const fileName = `${exports?.filename || docConfigs?.docFilename || "document"}.${documentType}`;
  const title = exports?.title || docConfigs?.docTitle || "Document";
  const bufferData = await SrGenerateDocument
    .generateDocumentByType(data, documentType, colsToExport, {
      heading: title, dateDisplayFormat: "", prefNumFormat, excelDocFieldConfigs,
    });
  SrGenerateDocument.setAttachmentType(res, fileName, documentType);

  res.set("content-disposition", `attachment; filename="${fileName}";  filename*=UTF-8''${encodeURI(fileName)}`)
    .type(`.${documentType}`)
    .send(bufferData);
};

export const utGetExportDocType = (req: Request): DocumentTypeType => req.query.exportType as DocumentTypeType;

export const utIsExportDataRequest = (req: Request): boolean => {
  const query = utGetExportDocType(req);
  const validDocTypes: DocumentTypeType[] = ["xls", "csv", "pdf"];
  return !!(query?.length && validDocTypes.includes(query));
};
