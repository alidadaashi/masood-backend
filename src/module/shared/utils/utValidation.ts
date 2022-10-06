import { NextFunction, Request, Response } from "express";
import { body, ValidationChain, validationResult } from "express-validator";
import cfgApp from "../../../base/configs/cfgApp";
import { ALPHA_TEXT_WITH_SPACE } from "../constants/dtOtherConstants";
import { utFormatNumericValueForDb, utFormatNumericValueWithUserPref } from "./utString";

export const utIsNonNumberString = (value: string): boolean => !!(value && /[0-9]/.test(String(value)
  .toLowerCase()));

export const utIsObjVld = (column: string, alias: string): ValidationChain => body(column, `The ${alias} is required`)
  .exists({
    checkFalsy: true,
    checkNull: true,
  })
  .isObject()
  .withMessage(`The ${alias} is not valid object`);

export const utIsRequiredVld = (column: string, alias: string): ValidationChain => body(column, `The ${alias} is required`)
  .trim()
  .exists({
    checkFalsy: true,
    checkNull: true,
  })
  .bail();

const utGetDefaultValidator = (
  column: string, alias: string, vchain?: ValidationChain,
): ValidationChain => vchain || utIsRequiredVld(column, alias);

export const utIsPasswordVld = (
  column: string, alias: string, vchain?: ValidationChain,
): ValidationChain => utGetDefaultValidator(column, alias, vchain)
  .isLength({ min: cfgApp.minimumPasswordLength })
  .withMessage(`The password should be at least ${cfgApp.minimumPasswordLength} characters long`)
  .bail();

export const utIsEmailVld = (column: string, alias: string): ValidationChain => utIsRequiredVld(column, alias)
  .isEmail()
  .withMessage("The email is not valid")
  .bail();

export const utIsAlphaTextVld = (column: string, alias: string): ValidationChain => utIsRequiredVld(column, alias)
  .matches(ALPHA_TEXT_WITH_SPACE)
  .withMessage(`The ${alias} should not contain non alpha character`)
  .bail();

export const utValidationResultMW = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  const firstError = errors.array({ onlyFirstError: true });
  if (!errors.isEmpty()) {
    res.status(422)
      .json({ message: firstError[0].msg });
  } else {
    next();
  }
};

const utCheckValidFormattedAsPreference = (value: string, decimal: string, separator: string, format: string) => {
  if (value.toString().includes(decimal) && value.toString().includes(separator)) {
    if (value.toString().lastIndexOf(decimal) < value.toString().lastIndexOf(separator)) return false;
  }
  const valueWithSepRemoved = utFormatNumericValueForDb(value, format);
  const formattedValue = utFormatNumericValueWithUserPref(valueWithSepRemoved, format);
  return value.toString() === formattedValue.toString();
};

export const utIsValidFormattedDecimal = (value: string, format: string): boolean => {
  const validFormats = [",sep.decimal", ".sep,decimal"];
  const decimal = validFormats.includes(format) ? format[4] : ",";
  const separator = validFormats.includes(format) ? format[0] : ".";
  if (!value.toString().includes(decimal) && !value.toString().includes(separator)) {
    return true;
  }
  return utCheckValidFormattedAsPreference(value, decimal, separator, format);
};
