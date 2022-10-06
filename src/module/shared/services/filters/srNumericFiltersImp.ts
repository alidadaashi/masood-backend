import { QueryBuilder } from "knex";
import MdUnprocessableEntityError from "../../../../base/errors/mdUnprocessableEntityError";
import { MESSAGE_MUST_BE_NUMERIC_VALUE_FILTER } from "../../constants/dtOtherConstants";
import { FilterParamsType } from "../../types/tpFilter";
import {
  FILTER_FIELD_MULTI_VALUE_DELIMITER,
  utGetMultiSearchNumberValues,
} from "../../utils/utFilter";

export const srBuildNumericEqualsCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhere(filterParams.field, filterParams.value);
  } else {
    qb.orWhere(filterParams.field, filterParams.value);
  }
};

export const srBuildNumericNotEqualsCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhereNot(filterParams.field, filterParams.value);
  } else {
    qb.orWhereNot(filterParams.field, filterParams.value);
  }
};

export const srBuildNumericIsGreaterThanOrEqualsToCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhere(filterParams.field, ">=", filterParams.value);
  } else {
    qb.orWhere(filterParams.field, ">=", filterParams.value);
  }
};

export const srBuildNumericIsLessThanOrEqualsToCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhere(filterParams.field, "<=", filterParams.value);
  } else {
    qb.orWhere(filterParams.field, "<=", filterParams.value);
  }
};

export const srBuildNumericIsLessThanCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhere(filterParams.field, "<", filterParams.value);
  } else {
    qb.orWhere(filterParams.field, "<", filterParams.value);
  }
};

export const srBuildNumericIsGreaterThanCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.type === "and") {
    qb.andWhere(filterParams.field, ">", filterParams.value);
  } else {
    qb.orWhere(filterParams.field, ">", filterParams.value);
  }
};

export const srBuildNumericBetweenCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  if (filterParams.value && filterParams.value.trim()
    .indexOf(FILTER_FIELD_MULTI_VALUE_DELIMITER) !== -1) {
    const [from, to] = filterParams.value.split(FILTER_FIELD_MULTI_VALUE_DELIMITER);
    if (from && to) {
      if (filterParams.type === "and") {
        qb.andWhereBetween(filterParams.field, [from, to]);
      } else {
        qb.orWhereBetween(filterParams.field, [from, to]);
      }
    }
  }
};

export const srBuildNumericIsNullCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
): void => {
  qb.whereNull(filterParams.value);
};

export const srBuildNumericSearchMultipleCriteria = (
  qb: QueryBuilder, filterParams: FilterParamsType,
):void => {
  const values = utGetMultiSearchNumberValues(filterParams.value);
  if (values.some((v) => Number.isNaN(v))) {
    throw new MdUnprocessableEntityError(MESSAGE_MUST_BE_NUMERIC_VALUE_FILTER);
  }
  if (values) {
    if (filterParams.type === "and") {
      qb.whereIn(filterParams.field, values);
    } else {
      qb.orWhereIn(filterParams.field, values);
    }
  }
};
