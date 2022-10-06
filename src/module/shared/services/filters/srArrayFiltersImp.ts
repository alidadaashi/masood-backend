import { QueryBuilder } from "knex";
import { FilterParamsType } from "../../types/tpFilter";
import { FILTER_FIELD_MULTI_VALUE_DELIMITER } from "../../utils/utFilter";

export const srBuildArrayIsInCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  const values = filterParams.value.split(FILTER_FIELD_MULTI_VALUE_DELIMITER);
  if (values.length) {
    if (filterParams.type === "and") {
      qb.whereIn(filterParams.field, values);
    } else {
      qb.orWhereIn(filterParams.field, values);
    }
  }
};

export const srBuildArrayIsNotInCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  const values = filterParams.value.split(FILTER_FIELD_MULTI_VALUE_DELIMITER);
  if (values.length) {
    if (filterParams.type === "and") {
      qb.whereNotIn(filterParams.field, values);
    } else {
      qb.orWhereNotIn(filterParams.field, values);
    }
  }
};
