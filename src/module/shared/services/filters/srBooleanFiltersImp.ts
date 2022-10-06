import { QueryBuilder } from "knex";
import { FilterParamsType } from "../../types/tpFilter";

export const srBuildBooleanEqualsCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhere(filterParams.field, filterParams.value);
  } else {
    qb.orWhere(filterParams.field, filterParams.value);
  }
};

export const other = "";
