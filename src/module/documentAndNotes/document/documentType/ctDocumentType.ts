import { Request, Response, NextFunction } from "express";
import {
  tpDocumentOrigin, tpDocumentTypeParams,
} from "../../../shared/types/tpShared";
import knex from "../../../../base/database/cfgKnex";
import { GridFilterStateType } from "../../../shared/types/tpFilter";
import SrDocumentType, { srCheckExistingOrEmptyName, srCheckValidHierarchyType } from "./srDocumentType";
import {
  MESSAGE_DOCUMENT_TYPE_CREATED, MESSAGE_DOCUMENT_TYPE_DELETED, MESSAGE_DOCUMENT_TYPE_UPDATED,
  SYSTEM_DEFINED_DOCUMENT_TYPES_KEY,
} from "../../../shared/constants/dtOtherConstants";

class CtDocumentType {
  static async getAllDocumentTypes(
    req: Request<{ dntDefinedType: tpDocumentTypeParams }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const filters = req.query as unknown as GridFilterStateType;
        const { data, total, allIds } = await SrDocumentType.getAllDocumentTypes(trx, filters, req.params.dntDefinedType);
        res.sendList({ list: data, total, allIds });
      });
    } catch (e) {
      next(e);
    }
  }

  static async addDocumentTypes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const reqData = req.body;
      const { dntDefinedType } = req.params;
      const origin: tpDocumentOrigin = dntDefinedType as tpDocumentOrigin ?? SYSTEM_DEFINED_DOCUMENT_TYPES_KEY;
      await knex.transaction(async (trx) => {
        srCheckValidHierarchyType(reqData);
        await srCheckExistingOrEmptyName(trx, reqData);
        let data = {};
        if (origin === SYSTEM_DEFINED_DOCUMENT_TYPES_KEY) {
          data = await SrDocumentType.addSysDefDocumentTypes(trx, reqData);
        } else {
          data = await SrDocumentType.addUserDefDocumentTypes(trx, reqData);
        }
        res.sendObject(data, MESSAGE_DOCUMENT_TYPE_CREATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateDocumentTypes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const reqData = req.body;
      const { dntDefinedType } = req.params;
      if (reqData && dntDefinedType) {
        const origin: tpDocumentOrigin = dntDefinedType as tpDocumentOrigin ?? SYSTEM_DEFINED_DOCUMENT_TYPES_KEY;
        await knex.transaction(async (trx) => {
          let data = {};
          if (origin === SYSTEM_DEFINED_DOCUMENT_TYPES_KEY) {
            data = await SrDocumentType.updateSysDefDocumentTypes(trx, reqData);
          } else {
            data = await SrDocumentType.updateUserDefDocumentTypes(trx, reqData);
          }
          res.sendObject(data, MESSAGE_DOCUMENT_TYPE_UPDATED);
        });
      }
    } catch (e) {
      next(e);
    }
  }

  static async deleteDocumentTypes(
    req: Request,
    res:Response,
    next:NextFunction,
  ):Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        await SrDocumentType.deleteDocumentTypes(trx, req.body);
        res.sendMsg(MESSAGE_DOCUMENT_TYPE_DELETED);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtDocumentType;
