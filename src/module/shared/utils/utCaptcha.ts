import { Request, Response } from "express";
import fetch from "node-fetch";

const captchaVerificationGoogleUrl = "";
const captchaSecretKey = "";
const utVerifyCaptcha = async (
  req: Request,
  _res: Response,
  captchaValue: string,
): Promise<boolean> => {
  let isHuman = false;
  isHuman = await fetch(captchaVerificationGoogleUrl, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    body: `secret=${captchaSecretKey}&response=${captchaValue}`,
  })
    .then((resp) => resp.json())
    .then((json) => json.success)
    .catch((err) => {
      throw new Error(`Error in Google Siteverify API. ${err.message}`);
      return isHuman;
    });
  if (captchaValue === null || !isHuman) {
    return isHuman;
  }
  return isHuman;
};
export default utVerifyCaptcha;
