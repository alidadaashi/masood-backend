import moment from "moment";
import {
  DateDurationFuncType,
  DateRangeFuncType,
  FilterDateDurationOperatorsType,
  FilterDateRangeOperatorsType,
} from "../types/tpFilter";

export const utIsValidDate = (isoString: string): boolean => {
  const date = new Date(isoString);
  return date.toString() !== "Invalid Date";
};

export const utGetDateFromISO = (isoString: string|null): string | null => {
  if (isoString) {
    const date = new Date(isoString);
    if (date.toString() !== "Invalid Date") {
      return moment(date).format();
    }
  }

  return null;
};

export const utFormatDate = (date = new Date(), dateFormat: string): string => {
  if (date) {
    return moment(date).format(dateFormat);
  }
  return moment(new Date()).format(dateFormat);
};

const utRangeToday = (): string => moment().format();
const utRangeTomorrow = (): string => moment().add("1", "day").format();
const utRangeYesterday = (): string => moment().subtract("1", "day").format();
const utRangeStartOfThisWeek = (): string => moment().startOf("week").format();
const utRangeEndOfThisWeek = (): string => moment().endOf("week").format();
const utRangeStartOfThisMonth = (): string => moment().startOf("month").format();
const utRangeEndOfThisMonth = (): string => moment().endOf("month").format();
const utRangeStartOfThisYear = (): string => moment().startOf("year").format();
const utRangeEndOfThisYear = (): string => moment().endOf("year").format();
const utRangeStartOfLastWeek = (): string => moment().days(-7).startOf("week").format();
const utRangeEndOfLastWeek = (): string => moment().days(-7).endOf("week").format();
const utRangeStartOfLastMonth = (): string => moment().subtract("1", "month").startOf("month").format();
const utRangeEndOfLastMonth = (): string => moment().subtract("1", "month").endOf("month").format();
const utRangeStartOfLastYear = (): string => moment().subtract("1", "year").startOf("year").format();
const utRangeEndOfLastYear = (): string => moment().subtract("1", "year").endOf("year").format();
const utRangeStartOfNextWeek = (): string => moment().days(+7).startOf("week").format();
const utRangeEndOfNextWeek = (): string => moment().days(+7).endOf("week").format();
const utRangeStartOfNextMonth = (): string => moment().add("1", "month").startOf("month").format();
const utRangeEndOfNextMonth = (): string => moment().add("1", "month").endOf("month").format();
const utRangeStartOfNextYear = (): string => moment().add("1", "year").startOf("year").format();
const utRangeEndOfNextYear = (): string => moment().add("1", "year").endOf("year").format();
const utRangeStartOfQuarter1 = (): string => moment().quarter(1).startOf("quarter").format();
const utRangeStartOfQuarter2 = (): string => moment().quarter(2).startOf("quarter").format();
const utRangeStartOfQuarter3 = (): string => moment().quarter(3).startOf("quarter").format();
const utRangeStartOfQuarter4 = (): string => moment().quarter(4).startOf("quarter").format();
const utRangeEndOfQuarter1 = (): string => moment().quarter(1).endOf("quarter").format();
const utRangeEndOfQuarter2 = (): string => moment().quarter(2).endOf("quarter").format();
const utRangeEndOfQuarter3 = (): string => moment().quarter(3).endOf("quarter").format();
const utRangeEndOfQuarter4 = (): string => moment().quarter(4).endOf("quarter").format();

const dateRangeFromOneSide: DateRangeFuncType = {
  today: utRangeToday,
  tomorrow: utRangeTomorrow,
  yesterday: utRangeYesterday,
  "start-of-this-week": utRangeStartOfThisWeek,
  "start-of-this-month": utRangeStartOfThisMonth,
  "start-of-this-year": utRangeStartOfThisYear,
  "start-of-last-week": utRangeStartOfLastWeek,
  "start-of-last-month": utRangeStartOfLastMonth,
  "start-of-last-year": utRangeStartOfLastYear,
  "start-of-next-week": utRangeStartOfNextWeek,
  "start-of-next-month": utRangeStartOfNextMonth,
  "start-of-next-year": utRangeStartOfNextYear,
  "end-of-this-week": utRangeEndOfThisWeek,
  "end-of-this-month": utRangeEndOfThisMonth,
  "end-of-this-year": utRangeEndOfThisYear,
  "end-of-last-week": utRangeEndOfLastWeek,
  "end-of-last-month": utRangeEndOfLastMonth,
  "end-of-last-year": utRangeEndOfLastYear,
  "end-of-next-week": utRangeEndOfNextWeek,
  "end-of-next-month": utRangeEndOfNextMonth,
  "end-of-next-year": utRangeEndOfNextYear,
  "start-of-q1": utRangeStartOfQuarter1,
  "start-of-q2": utRangeStartOfQuarter2,
  "start-of-q3": utRangeStartOfQuarter3,
  "start-of-q4": utRangeStartOfQuarter4,
  "end-of-q1": utRangeEndOfQuarter1,
  "end-of-q2": utRangeEndOfQuarter2,
  "end-of-q3": utRangeEndOfQuarter3,
  "end-of-q4": utRangeEndOfQuarter4,
};

export const utGetDateRangeFromOneSide = (duration: FilterDateRangeOperatorsType): string | null => {
  const rangeFunc = dateRangeFromOneSide[duration];
  if (typeof rangeFunc === "function") return rangeFunc();
  return null;
};

const utDurationToday = (): [string | null, string | null] => [utGetDateRangeFromOneSide("today"),
  utGetDateRangeFromOneSide("today")];
const utDurationTomorrow = (): [string | null, string | null] => [utGetDateRangeFromOneSide("tomorrow"),
  utGetDateRangeFromOneSide("tomorrow")];
const utDurationYesterday = (): [string | null, string | null] => [utGetDateRangeFromOneSide("yesterday"),
  utGetDateRangeFromOneSide("yesterday")];
const utDurationThisWeek = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-this-week"),
  utGetDateRangeFromOneSide("end-of-this-week")];
const utDurationThisMonth = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-this-month"),
  utGetDateRangeFromOneSide("end-of-this-month")];
const utDurationThisYear = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-this-year"),
  utGetDateRangeFromOneSide("end-of-this-year")];
const utDurationLastWeek = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-last-week"),
  utGetDateRangeFromOneSide("end-of-last-week")];
const utDurationLastMonth = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-last-month"),
  utGetDateRangeFromOneSide("end-of-last-month")];
const utDurationLastYear = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-last-year"),
  utGetDateRangeFromOneSide("end-of-last-year")];
const utDurationNextWeek = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-next-week"),
  utGetDateRangeFromOneSide("end-of-next-week")];
const utDurationNextMonth = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-next-month"),
  utGetDateRangeFromOneSide("end-of-next-month")];
const utDurationNextYear = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-next-year"),
  utGetDateRangeFromOneSide("end-of-next-year")];
const utDurationOfQuarter1 = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-q1"),
  utGetDateRangeFromOneSide("end-of-q1")];
const utDurationOfQuarter2 = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-q2"),
  utGetDateRangeFromOneSide("end-of-q2")];
const utDurationOfQuarter3 = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-q3"),
  utGetDateRangeFromOneSide("end-of-q3")];
const utDurationOfQuarter4 = (): [string | null, string | null] => [utGetDateRangeFromOneSide("start-of-q4"),
  utGetDateRangeFromOneSide("end-of-q4")];

const dateDurationBothSides: DateDurationFuncType = {
  today: utDurationToday,
  tomorrow: utDurationTomorrow,
  yesterday: utDurationYesterday,
  "this-week": utDurationThisWeek,
  "this-month": utDurationThisMonth,
  "this-year": utDurationThisYear,
  "last-week": utDurationLastWeek,
  "last-month": utDurationLastMonth,
  "last-year": utDurationLastYear,
  "next-week": utDurationNextWeek,
  "next-month": utDurationNextMonth,
  "next-year": utDurationNextYear,
  q1: utDurationOfQuarter1,
  q2: utDurationOfQuarter2,
  q3: utDurationOfQuarter3,
  q4: utDurationOfQuarter4,
};

export const utGetDurationBothSides = (duration: FilterDateDurationOperatorsType): [string | null, string | null] => {
  const durationFunc = dateDurationBothSides[duration];
  if (typeof durationFunc === "function") return durationFunc();
  return [null, null];
};

export const other = "";
