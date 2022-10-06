import { Request, Response, NextFunction } from "express";
import {
  MSG_NOTE_CREATED, MSG_NOTE_UPDATED, NOTE_DELETED_SUCCESSFULLY,
} from "../../../shared/constants/dtOtherConstants";
import knex from "../../../../base/database/cfgKnex";
import { GridFilterStateType } from "../../../shared/types/tpFilter";
import SrNote from "./srNote";
import { tpRecordsScope } from "../../../shared/types/tpShared";
import { utGetUserSession } from "../../../shared/utils/utOther";

class CtNote {
  static async getNotes(
    req: Request<{nRecordId: string, nScope: tpRecordsScope}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const { nRecordId, nScope } = req.params;
        const filters = req.query as unknown as GridFilterStateType;
        const { data, total } = await SrNote.getNotes(trx,
          filters,
          nRecordId,
          nScope);
        res.sendList({ list: data, total });
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateNote(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const sessionUser = utGetUserSession(req);
        const { nId } = req.params;
        const updatedNote = await SrNote.updateNote(
          trx,
          req.body,
          nId,
          sessionUser.uEntityId,
        );
        res.sendObject(updatedNote, MSG_NOTE_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async createNote(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const addedNote = await SrNote.createNote(
          trx,
          req.body,
          sessionUser.uEntityId,
        );
        res.sendObject(addedNote, MSG_NOTE_CREATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getNtSubTypes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const data = await SrNote.getNtSubTypes(trx);
        res.sendList({ list: data });
      });
    } catch (e) {
      next(e);
    }
  }

  static async deleteNote(
    req: Request<{ nId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const { nId } = req.params;
        const sessionUser = utGetUserSession(req);
        await SrNote.deleteNote(trx, nId, sessionUser.uEntityId);
        res.sendMsg(NOTE_DELETED_SUCCESSFULLY);
      });
    } catch (e) {
      next(e);
    }
  }
}
export default CtNote;
