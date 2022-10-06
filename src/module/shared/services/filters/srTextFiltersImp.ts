import { QueryBuilder } from "knex";
import { FilterParamsType } from "../../types/tpFilter";
import { utGetMultiSearchValues } from "../../utils/utFilter";

export const srBuildTextContainCriteria = (
  qb: QueryBuilder,
  filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhere(filterParams.field, "ILIKE", `%${filterParams.value}%`);
  } else {
    qb.orWhere(filterParams.field, "ILIKE", `%${filterParams.value}%`);
  }
};

export const srBuildTextDoesNotContainCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhereNot(filterParams.field, "ILIKE", `%${filterParams.value}%`);
  } else {
    qb.orWhereNot(filterParams.field, "ILIKE", `%${filterParams.value}%`);
  }
};

export const srBuildTextIsEqualToCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhere(filterParams.field, filterParams.value);
  } else {
    qb.orWhere(filterParams.field, filterParams.value);
  }
};

export const srBuildTextIsNotEqualToCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhereNot(filterParams.field, filterParams.value);
  } else {
    qb.orWhereNot(filterParams.field, filterParams.value);
  }
};

export const srBuildTextStartsWithCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhere(filterParams.field, "ILIKE", `${filterParams.value}%`);
  } else {
    qb.orWhere(filterParams.field, "ILIKE", `${filterParams.value}%`);
  }
};

export const srBuildTextEndsWithCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhere(filterParams.field, "ILIKE", `%${filterParams.value}`);
  } else {
    qb.orWhere(filterParams.field, "ILIKE", `%${filterParams.value}`);
  }
};

export const srBuildTextIsEmptyCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhereRaw("coalesce(TRIM(??), '') = ''", [filterParams.field]);
  } else {
    qb.orWhereRaw("coalesce(TRIM(??), '') = ''", [filterParams.field]);
  }
};

export const srBuildTextNotEndsWithCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhereNot(filterParams.field, "ILIKE", `%${filterParams.value}`);
  } else {
    qb.orWhereNot(filterParams.field, "ILIKE", `%${filterParams.value}`);
  }
};

export const srBuildTextSearchMultipleCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
):void => {
  const values = utGetMultiSearchValues(filterParams.value);
  if (values) {
    const lowerCol = qb.client.raw("LOWER(??)", [filterParams.field]);
    if (filterParams.type === "and") {
      qb.whereIn(lowerCol, values);
    } else {
      qb.orWhereIn(lowerCol, values);
    }
  }
};

export const srBuildTextIsNotEmptyCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhereRaw("coalesce(TRIM(??), '') <> ''", [filterParams.field]);
  } else {
    qb.orWhereRaw("coalesce(TRIM(??), '') <> ''", [filterParams.field]);
  }
};

export const srBuildTextIsNullCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  qb.whereNull(filterParams.field);
};

export const srBuildTextIsNotNullCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  qb.whereNotNull(filterParams.field);
};
