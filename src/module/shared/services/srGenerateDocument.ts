import xl from "excel4node";
import { Parser } from "json2csv";
import PdfPrinter from "pdfmake";
import { Response } from "express";
import { DocumentTypeType, GenerateDocumentPrintColsDetailType, GenerateDocumentPrintColsType } from "../types/tpShared";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { utRemoveValueRegexCode, utGenerateDocumentGetHeaderValues, utGenerateDocumentGetValuesForRow } from "../utils/utOther";
import { utPdfDocDefinition, pdfFonts } from "../utils/utPdf";
import { ERR_NO_DATA_EXPORT, MESSAGE_SOME_THING_WENT_WRONG } from "../constants/dtOtherConstants";
import { COL_TRANS_ROW_CAMPAIGN_ID, COL_TRANS_ROW_I18N_ROUTE } from "../constants/dtI18nModuleConstants";

export type tpExcelDocFieldsConfig = {
  lockCells?: string[],
  comboFieldCells?: { range: string, fields: string[] }[],
  customHeaderStyles?: { columns?: GenerateDocumentPrintColsType, style: unknown }
};

const srLockCell = (worksheet: any, range: string) => {
  worksheet.addDataValidation({
    type: "textLength",
    error: "Alan düzenlenemez.",
    operator: "equal",
    sqref: range,
    formulas: [""],
  });
};

const srSetComboCells = (worksheet: any, range: string, comboFieldValues: string[]) => {
  worksheet.addDataValidation({
    type: "list",
    allowBlank: true,
    error: "Geçersiz seçim seçildi",
    showDropDown: true,
    sqref: range,
    formulas: comboFieldValues,
  });
};

const srGetExcelFunctions = () => {
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet("Project");
  return { ws, wb };
};

const srSetFieldConfigs = (ws: any, wb: xl.Workbook, configs?: tpExcelDocFieldsConfig) => {
  if (configs?.lockCells?.length) configs.lockCells.forEach((range) => srLockCell(ws, range));
  if (configs?.comboFieldCells?.length) {
    configs.comboFieldCells.forEach((obj) => srSetComboCells(ws, obj.range, obj.fields));
  }
};

const srCheckFileToHideSlugRows = (printColumns: GenerateDocumentPrintColsType): {
  isI18nFile: GenerateDocumentPrintColsDetailType;
  isCampaignDetailFile: GenerateDocumentPrintColsDetailType;
} => {
  const isI18nFile = printColumns[COL_TRANS_ROW_I18N_ROUTE];
  const isCampaignDetailFile = printColumns[COL_TRANS_ROW_CAMPAIGN_ID];
  return { isI18nFile, isCampaignDetailFile };
};
class SrGenerateDocument {
  static generateDocumentByType(
    data: unknown[],
    type: DocumentTypeType,
    printColumns: GenerateDocumentPrintColsType | null,
    {
      heading, dateDisplayFormat, prefNumFormat, excelDocFieldConfigs,
    }: {
      heading: string, dateDisplayFormat: string, prefNumFormat?: string, excelDocFieldConfigs?: tpExcelDocFieldsConfig
    },
  ): Promise<string | Record<string, string> | Buffer> {
    if (data?.length && printColumns) {
      const filteredData = utRemoveValueRegexCode(data);
      if (type === "pdf") {
        return this.generatePdfDocument(filteredData, printColumns, heading, dateDisplayFormat as string);
      }
      if (type === "xls") {
        return Promise.resolve(this.generateExcelDocument(
          filteredData, printColumns, { dateDisplayFormat, prefNumFormat }, excelDocFieldConfigs,
        ));
      }
      if (type === "csv") {
        return this.generateCsvDocument(filteredData, printColumns, dateDisplayFormat as string);
      }
      return Promise.resolve("");
    }
    throw new MdUnprocessableEntityError(ERR_NO_DATA_EXPORT);
  }

  static setAttachmentType = (
    resp: Response,
    filename: string,
    type: DocumentTypeType,
  ): void => {
    if (type === "pdf") {
      resp.contentType("application/pdf");
      resp.attachment(`${filename}.pdf`);
    } else if (type === "xls") {
      resp.contentType("application/octet-stream");
      resp.attachment(`${filename}.xlsx`);
    } else if (type === "csv") {
      resp.contentType("application/octet-stream");
      resp.attachment(`${filename}.csv`);
    }
  };

  public static generateExcelDocument(
    data: unknown[],
    printColumns: GenerateDocumentPrintColsType,
    { dateDisplayFormat, prefNumFormat }: { dateDisplayFormat?: string, prefNumFormat?: string },
    configs?: tpExcelDocFieldsConfig,
  ): string {
    const { isI18nFile, isCampaignDetailFile } = srCheckFileToHideSlugRows(printColumns);
    const { ws, wb } = srGetExcelFunctions();
    srSetFieldConfigs(ws, wb, configs);

    const Body: string[][] = data.reduce((accum: string[][], d) => [
      ...accum,
      utGenerateDocumentGetValuesForRow(d, printColumns, dateDisplayFormat as string, prefNumFormat),
    ], []);

    const style = wb.createStyle({
      font: {
        size: 12,
      },
    });

    SrGenerateDocument.setDocumentHeaderWithCustomStyles(ws, wb, printColumns, configs);
    SrGenerateDocument.setDocumentRows(Body, ws, style);

    if (isI18nFile || isCampaignDetailFile) ws.row(2).hide();

    return wb.writeToBuffer();
  }

  private static setDocumentHeaderWithCustomStyles(
    ws: any, wb: xl.Workbook, printColumns: GenerateDocumentPrintColsType, configs?: tpExcelDocFieldsConfig,
  ) {
    const headerStyle = wb.createStyle({
      font: { bold: true },
    });

    SrGenerateDocument.setDocumentHeader(printColumns, ws, headerStyle);

    if (configs?.customHeaderStyles?.columns) {
      const customHeaderStyle = wb.createStyle(configs.customHeaderStyles.style);
      SrGenerateDocument.setCustomHeaderStyles(configs.customHeaderStyles?.columns, ws, customHeaderStyle);
    }
  }

  private static setDocumentHeader(printColumns: GenerateDocumentPrintColsType, ws: any, headerStyle: unknown) {
    const Header = Object.values(printColumns);
    Header.forEach((col, idx) => {
      if (typeof col === "object") {
        ws.cell(1, idx + 1)
          .string(col.title)
          .style(headerStyle);
      } else {
        ws.cell(1, idx + 1)
          .string(col)
          .style(headerStyle);
      }
      if (col.orderIndex === -1) ws.column(idx + 1).hide();
    });
  }

  private static setCustomHeaderStyles(columns: GenerateDocumentPrintColsType, ws: any, headerStyle: unknown) {
    const Header = Object.values(columns);
    Header.forEach((col) => {
      const orderIdx = parseInt(col.orderIndex as unknown as string, 10);
      ws.cell(1, orderIdx + 1)
        .style(headerStyle);
    });
  }

  private static setDocumentRows(Body: string[][], ws: any, style: unknown) {
    Body.forEach((row, rowIdx) => {
      row.forEach((col, colIdx) => {
        ws.cell(rowIdx + 2, colIdx + 1)
          .string(col)
          .style(style);
      });
    });
  }

  private static generateCsvDocument(
    data: unknown[], printColumns: GenerateDocumentPrintColsType, dateDisplayFormat: string,
  ): Promise<string> {
    const fields = utGenerateDocumentGetHeaderValues(printColumns);

    try {
      const parser = new Parser({ header: false });
      const mappedData = data.map((d) => utGenerateDocumentGetValuesForRow(d, printColumns, dateDisplayFormat));
      return Promise.resolve(parser.parse([fields, ...mappedData]));
    } catch (err) {
      throw new MdUnprocessableEntityError(MESSAGE_SOME_THING_WENT_WRONG);
    }

    return Promise.resolve("");
  }

  private static generatePdfDocument = (
    data: unknown[], printColumns: GenerateDocumentPrintColsType, heading: string, dateDisplayFormat: string,
  ): Promise<Buffer> => new Promise((res) => {
    const printer = new PdfPrinter(pdfFonts);

    const myTableLayouts = {
      exampleLayout: {},
    };

    const Header = utGenerateDocumentGetHeaderValues(printColumns);
    const Body = (data as string[]).reduce((accum: string[][], d) => [
      ...accum,
      utGenerateDocumentGetValuesForRow(d, printColumns, dateDisplayFormat),
    ], []);

    const pdfDoc = printer.createPdfKitDocument(utPdfDocDefinition([
      Header,
      ...Body,
    ], heading), { tableLayouts: myTableLayouts });

    const chunks: Buffer[] = [];
    pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.on("end", () => res(Buffer.concat(chunks)));
    pdfDoc.end();
  });
}

export default SrGenerateDocument;
