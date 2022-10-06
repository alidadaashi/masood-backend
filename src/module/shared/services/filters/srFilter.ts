import Knex, { QueryBuilder } from "knex";
import {
  FilterCheckFnType,
  FilterConditionType,
  FilterParamsType,
  FiltersImpType, FilterSortDirType, GridFilterItemType, GridFiltersSortType,
  GridFilterStateType,
  GridFiltersType,
  TFilterColumnsList,
  tpApplyFilterSortProps,
  tpCreateGroupQuery,
} from "../../types/tpFilter";
import {
  utCheckColumnsListLen, utGenerateFilterGroupQuery, utGenerateFilterOnlySumListQuery,
  utGenerateFilterOrderByQuery,
  utGenerateFilterUnionEvenQuery, utGetGroupList, utGetRowIdFromList, utGetSortOrderList, utGetSumList,
} from "../../utils/utFilter";
import {
  arrayFiltersImp,
  booleanFiltersImp, dateFiltersImp, numericFiltersImp, textFiltersImp,
} from "./srFiltersImp";
import cfgApp from "../../../../base/configs/cfgApp";
import knex from "../../../../base/database/cfgKnex";

const srInvokeFilterImp = (
  qb: QueryBuilder,
  filter: { [key: string]: FiltersImpType },
  filterParams: FilterParamsType,
) => {
  const filterFunc = filter[filterParams.operator];
  if (filterFunc) filterFunc(qb, filterParams);
};

const srFilterCriteria = (
  qb: QueryBuilder,
  filterParams: FilterParamsType,
) => {
  if (filterParams.operator) {
    if (filterParams.filter === "numeric") {
      srInvokeFilterImp(qb, numericFiltersImp, filterParams);
    } else if (filterParams.filter === "date") {
      srInvokeFilterImp(qb, dateFiltersImp, filterParams);
    } else if (filterParams.filter === "boolean") {
      srInvokeFilterImp(qb, booleanFiltersImp, filterParams);
    } else if (filterParams.filter === "array") {
      srInvokeFilterImp(qb, arrayFiltersImp, filterParams);
    } else {
      srInvokeFilterImp(qb, textFiltersImp, filterParams);
    }
  }
};

const srCreateGlobalSearchFilters = (
  filters: GridFilterItemType[], qb: QueryBuilder, type: FilterConditionType, field: string,
) => {
  filters.forEach((filter) => (srFilterCriteria(qb, {
    type, field, operator: filter.operator, value: filter.value,
  })));
};

const srCreateFilterWithAndConditionBetweenColumns = (
  filters: GridFilterItemType[], qb: QueryBuilder, type: FilterConditionType, field: string,
) => {
  const qbWhereType = type === "or" ? "orWhere" : "andWhere";
  qb[qbWhereType]((inQb) => (
    filters.forEach((filter) => (
      srFilterCriteria(inQb, {
        type, field, filter: filter.filter, operator: filter.operator, value: filter.value,
      })))
  ));
};

const srIsValidFieldFilters = (
  filters: GridFiltersType[string], type: FilterConditionType,
) => filters && Array.isArray(filters[type]) && filters[type].length;

const srCreateMultiFieldMultiFilterSearch = (
  fieldFilters: GridFiltersType[string],
  outerQb: QueryBuilder,
  field: string,
) => {
  outerQb.andWhere((qb) => {
    if (srIsValidFieldFilters(fieldFilters, "and")) {
      srCreateFilterWithAndConditionBetweenColumns(fieldFilters.and, qb, "and", field);
    }
    if (srIsValidFieldFilters(fieldFilters, "or")) {
      srCreateFilterWithAndConditionBetweenColumns(fieldFilters.or, qb, "or", field);
    }
  });
};

const srBuildCriteria = (
  outerQb: QueryBuilder,
  filters: GridFilterStateType,
  fieldCheckCb?: FilterCheckFnType,
) => {
  const allFilters = filters.filters;
  if (allFilters) {
    const filterFields = Object.keys(allFilters);
    const isGlobalSearch = filters.globalSearchText?.length;
    filterFields.forEach((field) => {
      const checkDbField = fieldCheckCb ? fieldCheckCb(field, "filter") : field;
      const fieldFilters = allFilters[field];
      if (checkDbField && fieldFilters) {
        if (isGlobalSearch) {
          srCreateGlobalSearchFilters(fieldFilters.or, outerQb, "or", checkDbField);
        } else {
          srCreateMultiFieldMultiFilterSearch(fieldFilters, outerQb, checkDbField);
        }
      }
    });
  }
};

const srApplyFilters = (
  outerQb: QueryBuilder,
  filters: GridFilterStateType,
  fieldCheckCb?: FilterCheckFnType,
) => {
  if (filters.filters && typeof filters.filters === "object") {
    outerQb.where((qb) => {
      srBuildCriteria(qb, filters, fieldCheckCb);
    });
  }
};

export const srApplySort = (
  qb: QueryBuilder,
  sort: GridFilterStateType["sort"],
  nonFilterFields?: string[],
  nonSortableFields?: string[],
): void => {
  if (sort?.length) {
    const firstSort = sort[0];
    if (firstSort && typeof firstSort === "object") {
      if (!nonSortableFields?.includes(firstSort.field)) {
        qb.clearOrder();
        qb.orderBy(firstSort.field, firstSort.dir);
      }
    }
  }
};

export const srGetSortDirValue = (sort?: FilterSortDirType): string | undefined => {
  if (sort === "asc") return "asc";
  if (sort === "desc") return "desc";
  return undefined;
};

export const srGetSortColumnsInOrder = (filterSort: GridFiltersSortType): string[] => Object.keys(filterSort)
  .sort((a, b) => {
    const filterAIdx = filterSort[b]?.sortOrderIndex;
    const filterBIdx = filterSort[a]?.sortOrderIndex;
    if (filterAIdx && filterBIdx) {
      return filterAIdx < filterBIdx ? 1 : -1;
    }
    return 0;
  });

export const srCreateGroupQuery = ({
  groupList, keyList, getColumnsList, allKeys, hiddenColumns, sortOrderList, fieldForSumArray, dbRowId, tablename,
}: tpCreateGroupQuery): Knex.Raw => knex.raw(
  `(select ${utGetRowIdFromList(keyList, hiddenColumns as string[], dbRowId) !== ""
    ? `${utGetRowIdFromList(keyList, hiddenColumns as string[], dbRowId)
    }::uuid as "dbSecondaryRowId"` : ""}${groupList.length && utGetRowIdFromList(
    keyList, hiddenColumns as string[], dbRowId,
  ) !== "" ? "," : ""} ${groupList
    .map((group) => `"${group}"`)} ${getColumnsList.length ? `,${getColumnsList.filter((key) => groupList
    .indexOf(key.column) === -1).map((key) => `"${key.column}"::${key.type}`)}` : ""} 
  from( select DISTINCT ${allKeys.map((key) => `"${key}"`)} from( ${utGenerateFilterGroupQuery({
  groupList, keyList, allKeys, hiddenColumns, tablename, dbRowId, fieldForSumArray,
})} ${utGenerateFilterOnlySumListQuery({
  groupList, keyList, allKeys, hiddenColumns, tablename, dbRowId, fieldForSumArray,
})} ${utGenerateFilterUnionEvenQuery({
  groupList, keyList, allKeys, hiddenColumns, tablename, dbRowId, fieldForSumArray,
})}) as temp1 (xid, ${keyList.filter((key) => key.includes("Id")).length ? "xord"
  : ""}${groupList.length && utGetRowIdFromList(keyList, hiddenColumns as string[], dbRowId) !== "" ? ","
  : ""} ${groupList.map((group) => `"${group}"`)}, ${keyList.filter((key) => groupList.indexOf(key) === -1)
  .map((key) => `"${key}"`)}) ${utGenerateFilterOrderByQuery({
  groupList, keyList, allKeys, hiddenColumns, tablename, dbRowId, fieldForSumArray,
}, sortOrderList)} ) as GBUB) as GBUB `
    .replace(/union all,/gi, "union all "),
);

export const srApplyFilterSort = ({
  qb,
  filterSort,
  columns,
  hiddenColumns,
  dbRowId,
  fieldForSumArray,
  fieldCheckCb,
}: tpApplyFilterSortProps): QueryBuilder => {
  if (filterSort) {
    const sortFields = srGetSortColumnsInOrder(filterSort);
    const groupList: string[] = utGetGroupList(filterSort);
    if (!(groupList.length <= utCheckColumnsListLen(columns.map((col) => col.column), hiddenColumns))) groupList.pop();
    const sortOrderList: string[] = columns?.length ? utGetSortOrderList(filterSort, groupList,
      [...columns.map((col) => col.column), ...groupList.map((group) => `${group}rno`)], fieldCheckCb) : [];
    sortFields.forEach((sortField: string) => {
      const checkField = fieldCheckCb ? fieldCheckCb(sortField, "sort") : sortField;
      if (checkField) {
        const sortDir = srGetSortDirValue(filterSort[sortField].sortDir);
        if (sortDir) {
          const groupFieled = groupList.filter((sortItemName) => sortItemName === checkField);
          if (!groupFieled?.length) {
            sortOrderList.push(`"${checkField}" ${sortDir}`);
          }
          if (filterSort[sortField].filter === "text") {
            qb.orderByRaw(`lower(??) ${sortDir}`, [checkField]);
          } else {
            qb.orderBy(checkField, sortDir);
          }
        }
      }
    });
    if ((groupList?.length && columns?.length) || fieldForSumArray.length) {
      const qb1 = knex.select("*").from(srCreateGroupQuery({
        groupList,
        keyList: columns.map((col) => col.column),
        getColumnsList: columns,
        hiddenColumns: hiddenColumns ? hiddenColumns.map((col) => col.column) : [],
        allKeys: [...columns.map((col) => col.column), ...groupList.map((group) => `${group}rno`)],
        sortOrderList,
        fieldForSumArray,
        dbRowId: dbRowId as string,
        tablename: qb.toQuery(),
      }));
      return qb1;
    }
  }
  return qb;
};

const srApplySumQueryOnFilters = ({
  qb,
  filterSort,
  columns,
  hiddenColumns,
  dbRowId,
  fieldForSumArray,
  fieldCheckCb,
}: tpApplyFilterSortProps): QueryBuilder => {
  if (filterSort) {
    const qb1 = srApplyFilterSort({
      qb,
      filterSort,
      columns,
      hiddenColumns,
      dbRowId,
      fieldForSumArray,
      fieldCheckCb,
    });
    return qb1;
  }
  if (fieldForSumArray.length) {
    const qb1 = knex.select("*").from(srCreateGroupQuery({
      groupList: [],
      keyList: columns.map((col) => col.column),
      getColumnsList: columns,
      hiddenColumns: hiddenColumns ? hiddenColumns.map((col) => col.column) : [],
      allKeys: [...columns.map((col) => col.column), ...[].map((group) => `${group}rno`)],
      sortOrderList: [],
      fieldForSumArray,
      dbRowId: dbRowId as string,
      tablename: qb.toQuery(),
    }));
    return qb1;
  }
  return qb;
};

const srApplyOffsetAndSelectedDataFilter = (
  qbInstance: QueryBuilder,
  filters: GridFilterStateType,
) => {
  const { getDataForSelectedRows } = filters;
  const canOffset = filters.skip > 0;
  if (canOffset) qbInstance.offset(filters.skip);
  if (getDataForSelectedRows && getDataForSelectedRows?.length > 0 && filters.dbRowId) {
    qbInstance.whereIn(
      `${filters.dbRowId}`, getDataForSelectedRows,
    );
  }
};

export const srBuildFilterCriteria = (
  qb: QueryBuilder,
  filters: GridFilterStateType,
  fieldCheckCb?: FilterCheckFnType,
  isWrapSortInSub = true,
): QueryBuilder => {
  let qbInstance = qb;

  if (filters) {
    srApplyFilters(qbInstance, filters, fieldCheckCb);
    qbInstance = isWrapSortInSub ? knex.select("*").from(qb.as("SUBQ")) : qb;
    const fieldForSumArray: string[] = utGetSumList(filters, fieldCheckCb);
    qbInstance = srApplySumQueryOnFilters({
      qb: qbInstance,
      filterSort: filters.filterSort,
      columns: filters.columnsList as TFilterColumnsList[],
      hiddenColumns: filters.hiddenColumns,
      dbRowId: filters.dbRowId,
      fieldForSumArray,
      fieldCheckCb,
    });

    srApplyOffsetAndSelectedDataFilter(qbInstance, filters);
  }

  qbInstance.limit(filters?.take || cfgApp.defaultDbRowsReturnLimit);

  return qbInstance;
};
