import { QueryBuilder } from "knex";
import { FilterDateDurationOperatorsType, FilterDateRangeOperatorsType, FilterParamsType } from "../../types/tpFilter";
import { utGetDateFromISO, utGetDateRangeFromOneSide, utGetDurationBothSides } from "../../utils/utDate";
import { utExtractMultiValFilters, FILTER_FIELD_MULTI_VALUE_DELIMITER } from "../../utils/utFilter";

const srGetDateRaw = (qb: QueryBuilder, field: string) => qb.client.raw("??::date", field);

export const srBuildDateExactCriteria = (qb: QueryBuilder, filterParams: FilterParamsType): void => {
  const value = utGetDateFromISO(filterParams.value);
  if (value) {
    if (filterParams.type === "and") {
      qb.andWhere(srGetDateRaw(qb, filterParams.field), "=", value);
    } else {
      qb.orWhere(srGetDateRaw(qb, filterParams.field), "=", value);
    }
  }
};

export const srBuildDateDuringCriteria = (qb: QueryBuilder, filterParams: FilterParamsType): void => {
  const value = filterParams.value as FilterDateDurationOperatorsType;
  const [start, end] = utGetDurationBothSides(value);
  if (start && end) {
    if (filterParams.type === "and") {
      qb.andWhereBetween(srGetDateRaw(qb, filterParams.field), [start, end]);
    } else {
      qb.orWhereBetween(srGetDateRaw(qb, filterParams.field), [start, end]);
    }
  }
};

export const srBuildDateInRangeCriteria = (qb: QueryBuilder, filterParams: FilterParamsType): void => {
  const multiVals = utExtractMultiValFilters<FilterDateRangeOperatorsType>(filterParams.value);
  if (multiVals) {
    const [startFrom, endsTo] = multiVals;
    const start = utGetDateRangeFromOneSide(startFrom);
    const end = utGetDateRangeFromOneSide(endsTo);

    if (start && end) {
      if (filterParams.type === "and") {
        qb.andWhereBetween(srGetDateRaw(qb, filterParams.field), [start, end]);
      } else {
        qb.orWhereBetween(srGetDateRaw(qb, filterParams.field), [start, end]);
      }
    }
  }
};

export const srBuildDateExcludeRangeCriteria = (qb: QueryBuilder, filterParams: FilterParamsType): void => {
  const multiVals = utExtractMultiValFilters<FilterDateRangeOperatorsType>(filterParams.value);
  if (multiVals) {
    const [startFrom, endsTo] = multiVals;
    const start = utGetDateRangeFromOneSide(startFrom);
    const end = utGetDateRangeFromOneSide(endsTo);
    if (start && end) {
      if (filterParams.type === "and") {
        qb.andWhereNotBetween(srGetDateRaw(qb, filterParams.field), [start, end]);
      } else {
        qb.orWhereNotBetween(srGetDateRaw(qb, filterParams.field), [start, end]);
      }
    }
  }
};

export const srBuildDateBetweenCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.value && filterParams.value.trim()
    .indexOf(FILTER_FIELD_MULTI_VALUE_DELIMITER) !== -1) {
    const [fromDateValue, toDateValue] = filterParams.value.split(FILTER_FIELD_MULTI_VALUE_DELIMITER);
    const fromDate = utGetDateFromISO(fromDateValue);
    const toDate = utGetDateFromISO(toDateValue);
    if (fromDate && toDate) {
      if (filterParams.type === "and") {
        qb.andWhereBetween(srGetDateRaw(qb, filterParams.field), [fromDate, toDate]);
      } else {
        qb.orWhereBetween(srGetDateRaw(qb, filterParams.field), [fromDate, toDate]);
      }
    }
  }
};

export const srBuildIsInCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (Array.isArray(filterParams.value)) {
    if (filterParams.type === "and") {
      qb.whereIn(filterParams.field, filterParams.value);
    } else {
      qb.orWhereIn(filterParams.field, filterParams.value);
    }
  }
};

export const srBuildStartsFromCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  const date = utGetDateFromISO(filterParams.value);
  if (date) {
    if (filterParams.type === "and") {
      qb.andWhere(filterParams.field, ">=", filterParams.value);
    } else {
      qb.orWhere(filterParams.field, ">=", filterParams.value);
    }
  }
};

export const srBuildEndsToCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  const date = utGetDateFromISO(filterParams.value);
  if (date) {
    if (filterParams.type === "and") {
      qb.andWhere(filterParams.field, "<=", filterParams.value);
    } else {
      qb.orWhere(filterParams.field, "<=", filterParams.value);
    }
  }
};
