import {
  FilterArrayOperatorsType,
  FilterBooleanOperatorsType,
  FilterDateOperatorsType, FilterNumericOperatorsType, FiltersImpType, FilterTextOperatorsType,
} from "../../types/tpFilter";
import {
  srBuildTextContainCriteria, srBuildTextDoesNotContainCriteria,
  srBuildTextEndsWithCriteria,
  srBuildTextIsEmptyCriteria, srBuildTextNotEndsWithCriteria, srBuildTextSearchMultipleCriteria,
  srBuildTextStartsWithCriteria,
} from "./srTextFiltersImp";
import {
  srBuildNumericBetweenCriteria,
  srBuildNumericEqualsCriteria,
  srBuildNumericIsGreaterThanCriteria,
  srBuildNumericIsGreaterThanOrEqualsToCriteria,
  srBuildNumericIsLessThanCriteria,
  srBuildNumericIsLessThanOrEqualsToCriteria,
  srBuildNumericIsNullCriteria,
  srBuildNumericNotEqualsCriteria,
  srBuildNumericSearchMultipleCriteria,
} from "./srNumericFiltersImp";
import {
  srBuildDateBetweenCriteria, srBuildDateDuringCriteria,
  srBuildDateExactCriteria, srBuildDateExcludeRangeCriteria, srBuildDateInRangeCriteria,
} from "./srDateFiltersImp";
import { srBuildBooleanEqualsCriteria } from "./srBooleanFiltersImp";
import { srBuildArrayIsInCriteria, srBuildArrayIsNotInCriteria } from "./srArrayFiltersImp";

export const textFiltersImp: Record<FilterTextOperatorsType, FiltersImpType> = {
  contains: srBuildTextContainCriteria,
  "not-contains": srBuildTextDoesNotContainCriteria,
  "starts-with": srBuildTextStartsWithCriteria,
  "ends-with": srBuildTextEndsWithCriteria,
  "is-empty": srBuildTextIsEmptyCriteria,
  "not-ends-with": srBuildTextNotEndsWithCriteria,
  "search-multiple": srBuildTextSearchMultipleCriteria,
};

export const numericFiltersImp: Record<FilterNumericOperatorsType, FiltersImpType> = {
  equals: srBuildNumericEqualsCriteria,
  "not-equals": srBuildNumericNotEqualsCriteria,
  "is-greater-than-or-equal-to": srBuildNumericIsGreaterThanOrEqualsToCriteria,
  "is-less-than-or-equal-to": srBuildNumericIsLessThanOrEqualsToCriteria,
  "is-less-than": srBuildNumericIsLessThanCriteria,
  "is-greater-than": srBuildNumericIsGreaterThanCriteria,
  between: srBuildNumericBetweenCriteria,
  "is-null": srBuildNumericIsNullCriteria,
  "search-multiple": srBuildNumericSearchMultipleCriteria,
};

export const dateFiltersImp: Record<FilterDateOperatorsType, FiltersImpType> = {
  exact: srBuildDateExactCriteria,
  "between-two": srBuildDateBetweenCriteria,
  during: srBuildDateDuringCriteria,
  "in-range": srBuildDateInRangeCriteria,
  "exclude-range": srBuildDateExcludeRangeCriteria,
};

export const booleanFiltersImp: Record<FilterBooleanOperatorsType, FiltersImpType> = {
  equals: srBuildBooleanEqualsCriteria,
};

export const arrayFiltersImp: Record<FilterArrayOperatorsType, FiltersImpType> = {
  "is-in": srBuildArrayIsInCriteria,
  "is-not-in": srBuildArrayIsNotInCriteria,
};
