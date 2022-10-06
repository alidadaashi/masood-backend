import { Request } from "express";
import { LANGUAGE_EN } from "../data/dtI18nLanguages";
import { GridFilterStateType } from "../types/tpFilter";

export const utGetReqLanguage = (
  req: Request, defaultLang = LANGUAGE_EN,
):string => req.headers["accept-language"] || defaultLang;

export const utReqGetMetaData = (
  req: Request,
): { filters: GridFilterStateType } => {
  const defaultValues = { filters: {} as GridFilterStateType };
  const metadata = req.body.meta;

  if (metadata) {
    return {
      ...metadata,
      filters: {
        ...(metadata?.filters || {}),
      },
    };
  }

  return defaultValues;
};
