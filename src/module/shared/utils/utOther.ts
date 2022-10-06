import { Request } from "express";
import { utFormatDate, utIsValidDate } from "./utDate";
import { GenerateDocumentPrintColsType, UserSessionType } from "../types/tpShared";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { ERR_SESSION_NOT_EXISTS, REMOVE_CODE_IN_CELL_VALUE_REGEX } from "../constants/dtOtherConstants";
import { utFormatNumericValueWithUserPref } from "./utString";

export const utGenerateDocumentGetValuesForRow = (
  d: unknown, printColumns: GenerateDocumentPrintColsType, dateDisplayFormat?: string, prefNumFormat?: string,
): string[] => Object
  .keys(printColumns)
  .map((f) => ({
    key: f,
    value: (d as Record<string, string>)[f],
  }))
  .map((k) => {
    if (printColumns[k.key]) {
      if (typeof printColumns[k.key] === "object") {
        if (printColumns[k.key].type === "date") {
          if (k.value !== null) {
            if (utIsValidDate(k.value)) return utFormatDate(new Date(k.value), dateDisplayFormat as string);
          } else {
            return "";
          }
        }
        if (typeof k.value === "boolean") return Boolean(k.value).toString();
        if (Number(k.value)) return utFormatNumericValueWithUserPref(k.value, prefNumFormat).toString();
        return k.value || "";
      }
    }

    return "";
  });

const utCheckValueType = (value: unknown): unknown => {
  if (typeof value === "object") return value;
  if (typeof value === "string" || typeof value === "number") {
    return (value as string).replace(REMOVE_CODE_IN_CELL_VALUE_REGEX, "");
  }
  return value;
};

export const utRemoveValueRegexCode = (data: unknown[]): unknown[] => {
  const temp = data.map((item) => Object.entries(item as Record<string, unknown>).map((key) => key)
    .reduce((a, [key, value]) => ({
      ...a,
      [key]: utCheckValueType(value),
    }), {}));
  return temp as unknown[];
};

export const utGenerateDocumentGetHeaderValues = (printColumns: GenerateDocumentPrintColsType): string[] => Object
  .keys(printColumns)
  .map((v) => {
    const colDetails = printColumns[v];

    if (typeof colDetails === "string") {
      return colDetails;
    }

    if (typeof colDetails === "object") {
      return colDetails.title;
    }

    return "";
  });

export const utGetUserSession = (req: Request): UserSessionType => {
  if (req?.session?.user) {
    return req.session.user;
  }

  throw new MdUnprocessableEntityError(ERR_SESSION_NOT_EXISTS);
};
