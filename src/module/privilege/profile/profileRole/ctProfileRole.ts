import { NextFunction, Request, Response } from "express";
import DoProfileRole from "./doProfileRole";
import knex from "../../../../base/database/cfgKnex";
import SrProfileRole from "./srProfileRole";
import { MESSAGE_PROFILE_DELETED, MESSAGE_PROFILE_UPDATED } from "../../../shared/constants/dtOtherConstants";

class CtProfileRole {
  static async getAllUserProfiles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const allPermissions = await DoProfileRole.getAllUserProfiles(trx);
        res.sendList({ list: allPermissions });
      });
    } catch (e) {
      next(e);
    }
  }

  static async getProfileRoles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { pId } = req.params;
      await knex.transaction(async (trx) => {
        const profileRoles = await DoProfileRole.getProfileRoles(trx, pId);
        res.sendList({ list: profileRoles });
      });
    } catch (e) {
      next(e);
    }
  }

  static async saveProfileRoles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        await SrProfileRole.saveProfileRoles(trx, req.body);
        res.sendMsg(MESSAGE_PROFILE_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateProfileRoles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { pId } = req.params;
      await knex.transaction(async (trx) => {
        await SrProfileRole.updateProfileRoles(trx, pId, req.body);
        res.sendMsg(MESSAGE_PROFILE_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async deleteProfileRoles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { pId } = req.params;
      await knex.transaction(async (trx) => {
        await SrProfileRole.deleteByProfile(trx, pId);
        res.sendMsg(MESSAGE_PROFILE_DELETED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async deleteMultipleProfileRoles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        await SrProfileRole.deleteMultipleProfiles(trx, req.body);
        res.sendMsg(MESSAGE_PROFILE_DELETED);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtProfileRole;
