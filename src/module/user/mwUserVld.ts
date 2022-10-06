import { body } from "express-validator";
import MdUser from "./mdUser";
import MdCredential from "./credentials/mdCredential";
import {
  utIsAlphaTextVld, utIsEmailVld, utIsPasswordVld, utValidationResultMW,
} from "../shared/utils/utValidation";

export const updatePasswordVldMw = utIsPasswordVld(
  MdCredential.col("cPassword", false), "password",
  body(MdCredential.col("cPassword", false))
    .if(body(MdCredential.col("cPassword", false))
      .trim()
      .isLength({ min: 1 })),
);

export const requiredPasswordVldMw = utIsPasswordVld(MdCredential.col("cPassword", false), "password");

export const requiredValidation = [
  utIsAlphaTextVld(MdUser.col("uFirstName", false), "first name"),
  utIsAlphaTextVld(MdUser.col("uLastName", false), "last name"),
  utIsEmailVld(MdCredential.col("cEmail", false), "email"),
];

export const mwUserVld = [
  ...requiredValidation,
  requiredPasswordVldMw,
  utValidationResultMW,
];

export const userUpdateVldMW = [
  ...requiredValidation,
  updatePasswordVldMw,
  utValidationResultMW,
];
