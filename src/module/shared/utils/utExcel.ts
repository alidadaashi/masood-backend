import xlsx from "node-xlsx";
import { GridFilterStateType } from "../types/tpFilter";

type tpExcelData = {name: string, data: unknown[][]};
type tpExcelDataAsJson = Record<string, unknown>;

const utTransformExcelDataAsJson = (excelData:unknown[][], headerIndex: number):tpExcelDataAsJson[]|undefined => {
  if (excelData) {
    const headers = excelData[headerIndex];
    const data = excelData.slice(headerIndex + 1);
    const finalData = [];

    const utBuildJson = (d: number) => {
      const dt = {} as Record<string, unknown>;
      for (let di = 0; di < data[d].length; di += 1) {
        const dataItem = data[d][di];
        const headerName = headers[di] as string;
        dt[headerName] = dataItem;
      }
      return dt;
    };

    for (let d = 0; d < data.length; d += 1) {
      finalData.push(utBuildJson(d));
    }
    return finalData.filter((value) => Object.keys(value).length !== 0);
  }
  return undefined;
};

export const utReadExcelFile = (
  file: Express.Multer.File|string,
  asJson = true,
  options?: {
    sheetNo?: number,
    headerIndex?: number
  },
):tpExcelData[]|tpExcelDataAsJson[]|undefined => {
  const filePathOrBuffer = typeof file === "string" ? file : file.buffer;
  const workSheetsFromFile = xlsx.parse(filePathOrBuffer) as unknown as tpExcelData[];
  if (workSheetsFromFile?.length) {
    const sheetNo = options?.sheetNo || 0;
    const headerIndex = options?.headerIndex || 0;
    if (asJson) return utTransformExcelDataAsJson(workSheetsFromFile[sheetNo].data, headerIndex);
    return workSheetsFromFile as unknown as tpExcelData[];
  }
  return undefined;
};

export const utGetColumnsForExport = (
  exports: GridFilterStateType["exports"],
  columns: string[],
): GridFilterStateType["exports"] => {
  const dtColumns = columns.map((column) => ({
    field: column,
    orderIndex: -1,
    visible: "true",
    type: "string",
    title: column,
  }));

  if (columns.includes("crId")) {
    return exports ? ({
      ...exports,
      columns: [...dtColumns, ...exports?.columns.map((col) => ({
        ...col,
        orderIndex: Number(col.orderIndex) + 1,
      }))],
    }) : exports;
  }
  return exports ? ({ ...exports, columns: [...dtColumns, ...exports.columns] }) : exports;
};
