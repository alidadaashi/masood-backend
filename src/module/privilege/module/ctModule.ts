import { NextFunction, Request, Response } from "express";
import SrModule from "./srModule";
import knex from "../../../base/database/cfgKnex";

class CtModule {
  static async getAllModules(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const modules = await SrModule.getAllModules(trx);
        res.sendList({ list: modules });
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllModulesHierarchy(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const modules = await SrModule.getAllModulesHierarchy(trx);
        res.sendList({ list: modules });
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtModule;
