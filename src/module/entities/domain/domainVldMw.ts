import { NextFunction, Request, Response } from "express";
import { utIsRequiredVld, utValidationResultMW } from "../../shared/utils/utValidation";
import MdDomainDetails from "./mdDomainDetails";
import { requiredPasswordVldMw, requiredValidation } from "../../user/mwUserVld";
import MdUser from "../../user/mdUser";

const domainNameVld = utIsRequiredVld(MdDomainDetails.col("dName", false), "domain name");

const domainVldMw = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const validations = [domainNameVld];
  if (!req.body.inEdit && !req.body[MdUser.col("uId", false)]) {
    validations.push(...requiredValidation, requiredPasswordVldMw);
  }
  await Promise.all(validations.map((validation) => validation.run(req)));
  utValidationResultMW(req, res, next);
};

export default domainVldMw;
