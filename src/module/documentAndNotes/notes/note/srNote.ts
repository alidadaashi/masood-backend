import { Transaction } from "knex";
import { tpNote, tpRecordsScope } from "../../../shared/types/tpShared";
import { srBuildFilterCriteria } from "../../../shared/services/filters/srFilter";
import { GridFilterStateType } from "../../../shared/types/tpFilter";
import { utCountTotalByQb } from "../../../shared/utils/utData";
import knex from "../../../../base/database/cfgKnex";
import doNote from "./doNote";
import doRecordTypeEntityType from "../../../shared/module/recordEntities/recordTypeEntityType/doRecordTypeEntityType";
import MdUnprocessableEntityError from "../../../../base/errors/mdUnprocessableEntityError";
import MdNotes from "./mdNote";
import {
  MSG_CANNOT_EDIT_DELETED_NOTE,
  MSG_NOTE_NOT_EXISTS,
  MSG_NOTE_TYPE_NOT_EXISTS,
  MSG_NOTE_SUB_TYPE_EXISTS_CANNOT_CREATE,
  ERR_MSG_NOTE_CANNOT_BE_DELETED,
  ERR_MSG_NOTE_CANNOT_BE_UPDATED,
} from "../../../shared/constants/dtOtherConstants";
import doDocAndNoteType from "../../docAndNoteType/doDocAndNoteType";
import { PURCHASE_ORDERS_PARENT_TYPE_ID } from "../../../shared/data/dtSysDefDocAndNoteTypes";

export const srGetRecordTypeEntityType = async (
  trx: Transaction,
  rtetRecordId: string,
): Promise<string> => {
  const recordTypeEntityType = await doRecordTypeEntityType.findOneByCol(trx, "rtetRecordId", rtetRecordId);
  return recordTypeEntityType.rtetId as string;
};

const srGetNtSubTypes = async (
  trx: Transaction,
): Promise<{ dntId: string, dntName: string }[]> => {
  const noteSubTypes = await doDocAndNoteType.findAllByPredicate(trx, { dntParentTypeId: PURCHASE_ORDERS_PARENT_TYPE_ID });
  return noteSubTypes.map((noteSubType) => ({
    dntId: noteSubType.dntId as string,
    dntName: noteSubType.dntName as string,
  }));
};

const srCheckNoteSubType = async (
  trx: Transaction,
  noteTypeId: string,
) => {
  const noteSubType = await doDocAndNoteType.findOneByCol(trx, "dntId", noteTypeId);
  if (!noteSubType) {
    throw new MdUnprocessableEntityError(MSG_NOTE_TYPE_NOT_EXISTS);
  }
  if (noteSubType.dntHierarchyType === "main") {
    const subTypeExist = await doDocAndNoteType.findOneByPredicate(trx, { dntParentTypeId: noteSubType.dntId });
    if (subTypeExist) {
      throw new MdUnprocessableEntityError(MSG_NOTE_SUB_TYPE_EXISTS_CANNOT_CREATE);
    }
  }
  return noteSubType;
};
class SrNote {
  static async getNotes(
    trx: Transaction,
    filters: GridFilterStateType,
    nRecordId: string,
    nScope: tpRecordsScope,
  ): Promise<{ data: tpNote[]; total: number }> {
    const rtetId = await srGetRecordTypeEntityType(trx, nRecordId);
    const getAllNotesQb = doNote.getAllNotes(trx, nScope, rtetId);
    const allNotesWrappedQb = knex.select("*").from(getAllNotesQb.as("SUBQ"));
    const qbWithFilters = srBuildFilterCriteria(allNotesWrappedQb, filters, undefined, false);
    const data = await qbWithFilters;
    const total = data.length ? await utCountTotalByQb(qbWithFilters) : 0;
    return { data, total };
  }

  static async createNote(
    trx: Transaction,
    newNote: tpNote,
    userId: string,
  ): Promise<MdNotes[]> {
    await srCheckNoteSubType(trx, newNote.nNoteTypeId);
    const newNoteAdded = await doNote.insertOne(trx, {
      nCreatedByUserId: userId,
      nRecordTypeEntityTypeId: newNote.nRecordTypeEntityTypeId,
      nNoteTypeId: newNote.nNoteTypeId,
      nBody: newNote.nBody,
      nScope: newNote.nScope,
      nStatus: "New",
    });
    return newNoteAdded;
  }

  static async updateNote(
    trx: Transaction,
    note: tpNote,
    noteId: string,
    userId: string,
  ): Promise<MdNotes[]> {
    const notes = await doNote.findOneByCol(trx, "nId", noteId);
    if (!notes) {
      throw new MdUnprocessableEntityError(MSG_NOTE_NOT_EXISTS);
    }
    if (notes.nCreatedByUserId !== userId) {
      throw new MdUnprocessableEntityError(ERR_MSG_NOTE_CANNOT_BE_UPDATED);
    }
    await srCheckNoteSubType(trx, note.nNoteTypeId);
    if (notes.nStatus === "Deleted") {
      throw new MdUnprocessableEntityError(MSG_CANNOT_EDIT_DELETED_NOTE);
    }
    const updatedNote = await doNote.updateOneByColName(trx, {
      nRecordTypeEntityTypeId: note.nRecordTypeEntityTypeId,
      nNoteTypeId: note.nNoteTypeId,
      nBody: note.nBody,
      nStatus: "Modified",
    }, "nId", noteId);
    return updatedNote;
  }

  static async getNtSubTypes(
    trx: Transaction,
  ): Promise<{ dntId: string; dntName: string }[]> {
    const ntSubTypes = await srGetNtSubTypes(trx);
    if (!ntSubTypes) {
      throw new MdUnprocessableEntityError(MSG_NOTE_TYPE_NOT_EXISTS);
    }
    return ntSubTypes;
  }

  static async deleteNote(
    trx: Transaction,
    nId: string,
    userId: string,
  ): Promise<void> {
    const note = await doNote.findOneByCol(trx, "nId", nId);
    if (userId !== note.nCreatedByUserId) {
      throw new MdUnprocessableEntityError(ERR_MSG_NOTE_CANNOT_BE_DELETED);
    }
    await doNote.updateOneByColName(trx, { nStatus: "Deleted" }, "nId", nId);
  }
}

export default SrNote;
