import { NextFunction, Request, Response } from "express";
import knex from "../../../base/database/cfgKnex";
import DoPermission from "./doPrivilege";

class CtPrivilege {
  static async getAllPermissions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const allPermissions = await DoPermission.getAll(trx, ["pId", "pPrivilege"]);
        res.sendList({ list: allPermissions });
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllPermissionsByModule(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { moduleId } = req.params;
      await knex.transaction(async (trx) => {
        const allPermissions = await DoPermission.getAllPermissionsByModule(trx, moduleId);
        res.sendList({ list: allPermissions });
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtPrivilege;
