import { NextFunction, Request, Response } from "express";
import { MESSAGE_ROLE_CREATED, MESSAGE_ROLE_UPDATED } from "../../../shared/constants/dtOtherConstants";
import knex from "../../../../base/database/cfgKnex";
import SrRolePrivilege from "./srRolePrivilege";

class CtRolePrivilege {
  static async addRolePermissions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const rolePermission = await SrRolePrivilege.addRolePermissions(trx, req.body);
        res.sendObject(rolePermission, MESSAGE_ROLE_CREATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateRolePermissions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { rId } = req.params;
      await knex.transaction(async (trx) => {
        const rolePermission = await SrRolePrivilege.updateRolePermissionsByRole(trx, rId, req.body);
        res.sendObject(rolePermission, MESSAGE_ROLE_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getRolePermissions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { rId } = req.params;
      await knex.transaction(async (trx) => {
        const data = await SrRolePrivilege.getRolePermissionsByRole(trx, rId);
        res.sendList({ list: data });
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtRolePrivilege;
