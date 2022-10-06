import { NextFunction, Request, Response } from "express";
import knex from "../../../../base/database/cfgKnex";
import SrNetworkTime from "./srNetworkTime";

class CtNetworkTime {
  static async getNetworkTime(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async () => {
        const response = await SrNetworkTime.getNetworkTime();
        res.sendObject(response);
      });
    } catch (e) {
      next(e);
    }
  }
}
export default CtNetworkTime;
