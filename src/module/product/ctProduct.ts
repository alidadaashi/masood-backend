import { NextFunction, Request, Response } from "express";
import { Transaction } from "knex";
import knex from "../../base/database/cfgKnex";
import SrProduct from "./srProduct";
import { utGetReqLanguage } from "../shared/utils/utRequest";
import { GridFilterStateType } from "../shared/types/tpFilter";
import SrUserSelectedInstance from "../user/userSelectedInstance/srUserSelectedInstance";
import { utGetUserSession } from "../shared/utils/utOther";
import MdUserSelectedInstance from "../user/userSelectedInstance/mdUserSelectedInstance";
import { MESSAGE_PRODUCT_CREATED } from "../shared/constants/dtOtherConstants";

class CtProduct {
  static async addProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = utGetUserSession(req);
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, user.uEntityId) as MdUserSelectedInstance;
        await SrProduct.addProduct(trx, usiSelectedInstanceEntityId as string, req.body);
        res.sendMsg(MESSAGE_PRODUCT_CREATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllProducts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = utGetUserSession(req);
      const language = utGetReqLanguage(req);
      const filters = req.query as unknown as GridFilterStateType;
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, user.uEntityId) as MdUserSelectedInstance;
        const { data, total, allIds } = await SrProduct
          .getAllProducts(trx, usiSelectedInstanceEntityId as string, language, filters);
        res.sendList({
          list: data, total, allIds,
        });
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtProduct;
