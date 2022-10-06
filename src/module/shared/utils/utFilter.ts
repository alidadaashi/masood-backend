import { QueryBuilder, Transaction } from "knex";
import knex from "../../../base/database/cfgKnex";
import { REMOVE_CODE_IN_CELL_VALUE_REGEX } from "../constants/dtOtherConstants";
import { srGetSortColumnsInOrder, srGetSortDirValue } from "../services/filters/srFilter";
import {
  FilterCheckFnType,
  GridFilterStateType, TFilterColumnsList, tpCheckAndGenerateSumQuery, tpGenerateFilterGroupQuery,
} from "../types/tpFilter";

export const FILTER_FIELD_MULTI_VALUE_DELIMITER = "||";
export const FILTER_FIELD_MULTI_SEARCH_VALUE_DELIMITER = ";";

export const utExtractMultiValFilters = <L = string, R = L>(
  value: string,
):[L, R]|null => value?.split(FILTER_FIELD_MULTI_VALUE_DELIMITER) as unknown as [L, R];

export const utGetMultiSearchValues = (
  value: string,
): string[] => value?.split(FILTER_FIELD_MULTI_SEARCH_VALUE_DELIMITER).map((v) => v?.toLowerCase());

export const utGetMultiSearchNumberValues = (
  value: string,
): number[] => value?.split(FILTER_FIELD_MULTI_SEARCH_VALUE_DELIMITER).map((v) => Number(v));

export const utCheckGroupIndexValues = (index: number, groupIndex: number, filterGroup: string):string => {
  if (groupIndex === index) return `"${filterGroup}"::varchar`;
  return `CONCAT("${filterGroup}"::varchar,'${REMOVE_CODE_IN_CELL_VALUE_REGEX}')::varchar AS "${filterGroup}"`;
};

export const utCheckColumnsListLen = (columns: string[], hiddenColumns?: TFilterColumnsList[]): number => (columns
  .filter((col) => !col.includes("Id") && !col.includes("Type")
&& !hiddenColumns?.filter((hCol) => col === hCol.column).length).length - 1);

export const utGetRowIdFromList = (keyList: string[], hiddenColumns: string[], dbRowId: string): string => {
  const listLength = keyList.filter((key) => key.includes("Id") && hiddenColumns?.indexOf(key) === -1).length;
  if (listLength === 1) {
    return `"${keyList.filter((key) => key.includes("Id") && hiddenColumns?.indexOf(key) === -1)}"`;
  }
  if (listLength > 1) {
    return `"${keyList.filter((key) => key
      .includes("Id") && hiddenColumns?.indexOf(key) === -1 && key === dbRowId)}"`;
  }

  return "";
};

export const utGetGroupList = (
  filterSort: GridFilterStateType["filterSort"],
): string[] => {
  const groupList: string[] = [];
  if (filterSort) {
    const sortFields = srGetSortColumnsInOrder(filterSort);
    sortFields.forEach((sortField: string) => {
      const isGroup = (filterSort[sortField].group as unknown as string === "true");
      if (isGroup) {
        groupList.push(sortField);
      }
    });
    return groupList;
  }

  return groupList;
};

const utCheckSortDir = (
  sortDir: string | undefined,
  checkField: string,
): string => {
  if (sortDir) {
    return `"${checkField}" ${sortDir}`;
  }
  return `"${checkField}"`;
};

export const utGetSortOrderList = (
  filterSort: GridFilterStateType["filterSort"],
  groupList: string[],
  allKeys: string[],
  fieldCheckCb?: FilterCheckFnType,
): string[] => {
  const sortOrderList: string[] = [];
  if (filterSort) {
    const sortFields = srGetSortColumnsInOrder(filterSort);
    if (groupList?.length) {
      groupList.forEach((group: string) => {
        sortFields.forEach((sortField: string) => {
          const checkField = fieldCheckCb ? fieldCheckCb(sortField, "sort") : sortField;
          if (checkField) {
            const sortDir = srGetSortDirValue(filterSort[sortField].sortDir);
            const fieledRowNo = allKeys.filter((allKey) => allKey === `${sortField}rno`);
            if (fieledRowNo?.length) {
              if (group === sortField) {
                sortOrderList.push(utCheckSortDir(sortDir, checkField));
                sortOrderList.push(`"${fieledRowNo[0]}"`);
              }
            }
          }
        });
      });
    }
    return sortOrderList;
  }

  return sortOrderList;
};

export const utGetSumList = (
  filters: GridFilterStateType,
  fieldCheckCb?: FilterCheckFnType,
): string[] => {
  const allFilters = filters.filters;
  const sumList: string[] = [];
  if (allFilters) {
    const filterFields = Object.keys(allFilters);
    filterFields.forEach((field) => {
      const checkDbField = fieldCheckCb ? fieldCheckCb(field, "filter") : field;
      const fieldFilters = allFilters[field];
      if (checkDbField && fieldFilters) {
        const isCalculateTotalColumnSummary = (fieldFilters.isCalculateTotalColumnSummary as unknown as string === "true");
        if (isCalculateTotalColumnSummary) {
          sumList.push(field);
        }
      }
    });
  }
  return sumList;
};

export const utGenerateFilterOrderByQuery = ({
  groupList, keyList, hiddenColumns, dbRowId, fieldForSumArray,
}: tpGenerateFilterGroupQuery, sortOrderList: string[]): string => `order by ${!groupList.length
  && fieldForSumArray.length ? `${utGetRowIdFromList(keyList, hiddenColumns as string[], dbRowId) !== ""
    ? `${utGetRowIdFromList(keyList, hiddenColumns as string[], dbRowId)}` : ""} NULLS FIRST` : ""}${!groupList
  .length && sortOrderList.length ? "," : ""} ${sortOrderList}`;

const utCheckAndGenerateSumQuery = ({
  groupList, allKey, fieldForSumArray, group, tablename,
}: tpCheckAndGenerateSumQuery) => {
  if (groupList
    .indexOf(allKey) === -1) {
    return `${fieldForSumArray.filter((field) => field === allKey)
      .length ? `get_sum_value(format('select sum(cast("${allKey}" as int)) from (${tablename
        .replace(/'/gi, "''")}) as pp where %I=%L ','${group}',"${group}"))::varchar as ${allKey}` : "null"}`;
  }
  return "";
};

export const utGenerateFilterGroupQuery = ({
  groupList, keyList, hiddenColumns, dbRowId, allKeys, fieldForSumArray, tablename,
}: tpGenerateFilterGroupQuery): string[] => groupList.map((group, index) => `select ${
  utGetRowIdFromList(keyList, hiddenColumns as string[], dbRowId) !== ""
    ? `${utGetRowIdFromList(keyList, hiddenColumns as string[], dbRowId)},` : ""} ${index + 1}, ${groupList
  .map((filterGroup, groupIndex) => (groupIndex <= index ? utCheckGroupIndexValues(index, groupIndex, filterGroup)
    : "null"))}, ${(allKeys.filter((allKey) => groupList.indexOf(allKey) === -1)).map((allKey) => (allKey
  .includes("rno") ? `${allKey.includes(group) ? `1 as "${allKey}"` : `2 as "${allKey}"`}` : `${utCheckAndGenerateSumQuery({
    groupList, allKey, fieldForSumArray, group, tablename,
  })}`))} from (${tablename}) as UB${index + 1} union all`);

export const utGenerateFilterOnlySumListQuery = ({
  groupList, keyList, hiddenColumns, dbRowId, allKeys, fieldForSumArray, tablename,
}: tpGenerateFilterGroupQuery): string => (!groupList.length && fieldForSumArray.length ? `select ${
  utGetRowIdFromList(keyList, hiddenColumns as string[], dbRowId) !== ""
    ? `${utGetRowIdFromList(keyList, hiddenColumns as string[], dbRowId)},1,` : ""} ${allKeys
  .map((allKey) => `${(fieldForSumArray.indexOf(allKey) !== -1) ? `get_sum_value(format('select sum(cast("${
    allKey}" as int)) from (${tablename
    .replace(/'/gi, "''")}) as pp '))::varchar as ${allKey}` : "null"}`)} from (${tablename}) as UBSUM union all` : "");

export const utGenerateFilterUnionEvenQuery = ({
  groupList, keyList, hiddenColumns, dbRowId, allKeys, tablename,
}: tpGenerateFilterGroupQuery): string => `select ${utGetRowIdFromList(keyList, hiddenColumns as string[], dbRowId) !== ""
  ? `${utGetRowIdFromList(keyList, hiddenColumns as string[], dbRowId)},` : ""} ${!groupList.length ? "2" : groupList
  .length + 1}, ${groupList.map((group) => `CONCAT("${group}"::varchar,'${REMOVE_CODE_IN_CELL_VALUE_REGEX}')::varchar AS "${
  group}"`)}${groupList.length ? "," : ""}${allKeys.filter((allKey) => groupList.indexOf(allKey) === -1)
  .map((allKey) => (allKey.includes("rno") ? `2 as "${allKey}"` : `"${allKey}"::varchar`))} from (${tablename}) as UB${
  groupList.length + 1}`;

export const utGetAllDataIdsArray = async (
  trx: Transaction,
  qb: QueryBuilder,
  dbRowId: string,
): Promise<string[]> => {
  const subQ = trx.raw("? as SUBQ", [trx.raw(qb.toQuery()).wrap("(", ")")]);
  const allIdsObj = await knex(subQ).select(`${dbRowId}`);
  return allIdsObj.map((obj) => obj[dbRowId]);
};
