import { Request, Response, NextFunction } from "express";
import { MSG_NOTE_SUBTYPE_ADDED, MSG_NOTE_SUBTYPE_DELETED, MSG_NOTE_SUBTYPE_UPDATED } from "../../../shared/constants/dtOtherConstants";
import knex from "../../../../base/database/cfgKnex";
import { GridFilterStateType } from "../../../shared/types/tpFilter";
import SrNoteType from "./srNoteType";

class CtNoteType {
  static async getAllNoteTypes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const filters = req.query as unknown as GridFilterStateType;
        const { data, total, allIds } = await SrNoteType.getAllNoteTypes(trx, filters);
        res.sendList({ list: data, total, allIds });
      });
    } catch (e) {
      next(e);
    }
  }

  static async addNoteSubType(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        await SrNoteType.addNoteSubType(trx, req.body);
        res.sendMsg(MSG_NOTE_SUBTYPE_ADDED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateNoteSubType(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        await SrNoteType.updateNoteSubType(trx, req.body);
        res.sendMsg(MSG_NOTE_SUBTYPE_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async deleteNoteSubtype(
    req: Request,
    res:Response,
    next:NextFunction,
  ):Promise<void> {
    const { ntId } = req.params;
    try {
      await knex.transaction(async (trx) => {
        await SrNoteType.deleteNoteSubType(trx, ntId);
        res.sendMsg(MSG_NOTE_SUBTYPE_DELETED);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtNoteType;
