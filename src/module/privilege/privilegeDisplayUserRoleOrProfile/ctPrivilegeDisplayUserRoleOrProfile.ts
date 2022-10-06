import { NextFunction, Request, Response } from "express";
import knex from "../../../base/database/cfgKnex";
import SrPrivilegeDisplayUserRoleOrProfile from "./srPrivilegeDisplayUserRoleOrProfile";

class CtPrivilegeDisplayUserRoleOrProfile {
  static async getUserAllPrivilegesProfiles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userEntityId } = req.params;
      await knex.transaction(async (trx) => {
        const allProfiles = await SrPrivilegeDisplayUserRoleOrProfile
          .getUserAllPrivilegesProfiles(trx, userEntityId);
        res.sendObject(allProfiles);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtPrivilegeDisplayUserRoleOrProfile;
