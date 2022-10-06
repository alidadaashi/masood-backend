declare module "excel4node" {
  export class Workbook {
    addWorksheet(type: string):any
    createStyle(d: unknown):unknown
    writeToBuffer():string
  }

  export const other = "";
}
