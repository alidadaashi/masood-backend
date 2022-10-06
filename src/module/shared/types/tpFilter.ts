import { QueryBuilder } from "knex";
import { GenerateDocumentPrintColsDetailType } from "./tpShared";

export type FilterConditionType = "or" | "and";

export type FilterTextOperatorsType = "contains" | "not-contains" | "starts-with" | "ends-with" |
  "not-ends-with" | "is-empty" | "search-multiple";
export type FilterNumericOperatorsType = "equals" | "not-equals" | "is-greater-than-or-equal-to" |
  "is-less-than-or-equal-to" | "is-less-than" | "is-greater-than" | "between" | "is-null" | "search-multiple"
export type FilterDateOperatorsType = "exact" | "between-two" | "during" | "in-range" | "exclude-range";
export type FilterBooleanOperatorsType = "equals";
export type FilterArrayOperatorsType = "is-in" | "is-not-in";

export type FilterDateDurationOperatorsType = "today" | "tomorrow" | "yesterday" | "this-week" | "this-month" | "this-year"
  | "last-week" | "last-month" | "last-year" | "next-week" | "next-month" | "next-year" | "q1" | "q2" | "q3" | "q4";

export type FilterDateRangeOperatorsType = "today" |
  "tomorrow" | "yesterday" |
  "start-of-this-week" | "start-of-this-month" | "start-of-this-year" |
  "start-of-last-week" | "start-of-last-month" | "start-of-last-year" |
  "start-of-next-week" | "start-of-next-month" | "start-of-next-year" |

  "end-of-this-week" | "end-of-this-month" | "end-of-this-year" |
  "end-of-last-week" | "end-of-last-month" | "end-of-last-year" |
  "end-of-next-week" | "end-of-next-month" | "end-of-next-year" |

  "start-of-q1" | "start-of-q2" | "start-of-q3" | "start-of-q4" |
  "end-of-q1" | "end-of-q2" | "end-of-q3" | "end-of-q4";

export type AllFilterOperatorsType = FilterTextOperatorsType | FilterNumericOperatorsType
  | FilterDateOperatorsType | FilterBooleanOperatorsType | "";

export type FiltersInputTypesType = "text" | "numeric" | "boolean" | "date" | "array";

export type FilterParamsType = Pick<GridFilterItemType, "filter" | "operator" | "value"> & {
  type: FilterConditionType,
  field: string,
};

export type TFilterColumnsList = {
  column: string,
  type: FiltersInputTypesType,
}

export type FiltersImpType = null | ((
  qb: QueryBuilder,
  filterParams: FilterParamsType,
) => void);

export type GridFilterItemType = {
  operator: AllFilterOperatorsType,
  value: string,
  id: string,
  filter?: FiltersInputTypesType,
  title?: string,
};

export type GridFiltersType = {
  [key: string]: {
    and: GridFilterItemType[],
    or: GridFilterItemType[],
    isCalculateTotalColumnSummary?: boolean,
  }
}

export type FilterSortDirType = "asc" | "desc" | "no";

export type GridFilterSortType = {
  id: string,
  title: string,
  sortDir?: FilterSortDirType,
  group?: boolean,
  sortOrderIndex?: number,
  filter?: FiltersInputTypesType,
}

export type GridFiltersSortType = {
  [key: string]: GridFilterSortType,
}

export type GridFilterStateType = {
  filters?: GridFiltersType,
  filterSort?: GridFiltersSortType,
  sort: { field: string, dir: string }[],
  skip: number,
  take: number,
  columnsList?: TFilterColumnsList[],
  hiddenColumns?: TFilterColumnsList[],
  dbRowId?: string,
  isHaveGrouping?: boolean,
  globalSearchText?: string,
  exports?: {
    title: string,
    filename: string,
    columns: GenerateDocumentPrintColsDetailType[],
  },
  isSelectAllRows?: boolean,
  getDataForSelectedRows?: string[]
};

export type tpApplyFilterSortProps = {
  qb: QueryBuilder,
  filterSort: GridFilterStateType["filterSort"],
  columns: TFilterColumnsList[],
  fieldForSumArray: string[],
  hiddenColumns?: TFilterColumnsList[],
  dbRowId?: string,
  fieldCheckCb?: FilterCheckFnType,
}

export type tpCheckAndGenerateSumQuery = {
  groupList: string[],
  allKey: string,
  fieldForSumArray: string[],
  group: string,
  tablename: string
}

export type tpGenerateFilterGroupQuery = {
  groupList: string[],
  keyList: string[],
  allKeys: string[],
  hiddenColumns?: string[],
  fieldForSumArray: string[],
  dbRowId: string,
  tablename: string,
}

export type tpCreateGroupQuery = tpGenerateFilterGroupQuery & {
  getColumnsList: TFilterColumnsList[],
  sortOrderList: string[],

}

export type DateRangeFuncType = Record<FilterDateRangeOperatorsType, () => string>;
export type DateDurationFuncType = Record<FilterDateDurationOperatorsType, () => [string | null, string | null]>;

export type FilterCheckFnType = (field: string, type: "filter" | "sort") => string | undefined;
