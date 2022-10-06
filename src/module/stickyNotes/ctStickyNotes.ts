import { NextFunction, Request, Response } from "express";
import knex from "../../base/database/cfgKnex";
import { srBuildFilterCriteria } from "../shared/services/filters/srFilter";
import { GridFilterStateType } from "../shared/types/tpFilter";
import { utCountTotalByQb } from "../shared/utils/utData";
import { utGetUserSession } from "../shared/utils/utOther";
import SrStickyNotes from "./srStickyNotes";
import { utGetAllDataIdsArray } from "../shared/utils/utFilter";
import {
  STICKY_NOTE_DELETED_SUCCESSFULLY, STICKY_NOTE_SENT_SUCCESSFULLY, STICKY_NOTE_UPDATED_SUCCESSFULLY,
} from "../shared/constants/dtOtherConstants";
import { utIsItgAdmin } from "../shared/utils/utAuth";
import SrUser from "../user/srUser";
import { utGetSelectedInstanceIds } from "../../routes/utAclHelper";

class CtStickyNotes {
  static async createStickyNote(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        await SrStickyNotes.createStickyNote(trx, session.uEntityId, req.body);
        res.sendMsg(STICKY_NOTE_SENT_SUCCESSFULLY);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getStickyNotes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        const { snStatus } = req.body;

        const query = (req.query as unknown) as GridFilterStateType;
        const getAllSnQb = SrStickyNotes.srGetUsersStickyNotesQb(
          trx, session.uEntityId, snStatus,
        );
        const qbWithFilters = srBuildFilterCriteria(getAllSnQb, query);
        const allIds = (query.isSelectAllRows as unknown as string === "true")
          ? await utGetAllDataIdsArray(trx, getAllSnQb, "snId") : [];
        const list = await qbWithFilters;
        res.sendList({
          list,
          total: await utCountTotalByQb(qbWithFilters),
          allIds,
        });
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllStickyNotes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const session = utGetUserSession(req);
        const isItgAdmin = utIsItgAdmin(session);
        const userInstances = await SrUser.getUserInstances(trx, session.uEntityId, isItgAdmin);
        const query = (req.query as unknown) as GridFilterStateType;
        const getAllSnQb = SrStickyNotes.srGetAllStickyNotesQb(
          trx, isItgAdmin, utGetSelectedInstanceIds(userInstances),
        );
        const qbWithFilters = srBuildFilterCriteria(getAllSnQb, query);
        const allIds = (query.isSelectAllRows as unknown as string === "true")
          ? await utGetAllDataIdsArray(trx, getAllSnQb, "snId") : [];
        const list = await qbWithFilters;
        return res.sendList({
          list,
          total: await utCountTotalByQb(qbWithFilters),
          allIds,
        });
      });
    } catch (e) {
      next(e);
    }
  }

  static async deleteStickyNote(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const { snId } = req.params;
        await SrStickyNotes.deleteStickyNote(trx, snId || "");
        res.sendMsg(STICKY_NOTE_DELETED_SUCCESSFULLY);
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateStickyNoteStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const { snId, value } = req.body;
        await SrStickyNotes.updateStickyNoteStatus(trx, snId, value);
        res.sendMsg(STICKY_NOTE_UPDATED_SUCCESSFULLY);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtStickyNotes;
