import { NextFunction, Request, Response } from "express";
import { utIsObjVld, utIsRequiredVld, utValidationResultMW } from "../../shared/utils/utValidation";
import { requiredPasswordVldMw, requiredValidation } from "../../user/mwUserVld";
import MdGroupDetails from "./mdGroupDetails";
import MdUser from "../../user/mdUser";

const domainVld = utIsObjVld("domain", "domain");
const groupNameVld = utIsRequiredVld(MdGroupDetails.col("gName", false), "group name");

const mwGroupVld = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const validations = [
    domainVld, groupNameVld,
  ];
  if (!req.body[MdUser.col("uId", false)] && !req.body.inEdit) {
    validations.push(
      ...requiredValidation,
      requiredPasswordVldMw,
    );
  }
  await Promise.all(validations.map((validation) => validation.run(req)));
  utValidationResultMW(req, res, next);
};

export default mwGroupVld;
