import { QueryBuilder } from "knex";
import { GenerateDocumentPrintColsType } from "../types/tpShared";
import cfgApp from "../../../base/configs/cfgApp";
import { GridFilterStateType } from "../types/tpFilter";

export const utCountTotalByQb = (qb: QueryBuilder): Promise<number> => qb.clearSelect()
  .clearOrder()
  .clearGroup()
  .offset(0)
  .limit(cfgApp.defaultDbRowsReturnLimit)
  .count()
  .first()
  .then((c: { count?: number }) => +(c?.count || 0));

export const utGetExportableColumns = (
  exports: GridFilterStateType["exports"],
  mappedCols?: Record<string, string>,
): GenerateDocumentPrintColsType|null => {
  if (exports?.columns?.length) {
    const columnsAsKeysValues = exports.columns
      .filter((column) => column.visible === "true")
      .reduce((accum, column):GenerateDocumentPrintColsType => {
        if (mappedCols && mappedCols[column.field]) return ({ ...accum, [mappedCols[column.field]]: column });
        return ({ ...accum, [column.field]: column });
      }, {});
    return columnsAsKeysValues;
  }
  return null;
};
