import { QueryBuilder, Transaction } from "knex";
import MdUnprocessableEntityError from "../../base/errors/mdUnprocessableEntityError";
import {
  tpStickyNotesData, tpStickyNotesStatus, tpStickyNoteBody,
} from "../shared/types/tpShared";
import DoRecordTypeEntityType from "../shared/module/recordEntities/recordTypeEntityType/doRecordTypeEntityType";
import DoStickyNotes from "./doStickyNotes";
import MdStickyNotes from "./mdStickyNotes";
import DoStickyNoteRef from "./stickyNoteRef/doStickyNoteRef";
import DoStickyNoteTousersEntity from "./stickyNoteToUsers_entity/doStickyNoteTousersEntity";
import {
  MESSAGE_INVALID_DATA, MSG_FAILED_SENDING_STICKY_NOTE, MSG_STICKY_NOTES_NOT_FOUND,
  RECORD_FILE_NOT_FOUND, STICKY_NOTE_STATUS, STICKY_NOTE_TYPE,
} from "../shared/constants/dtOtherConstants";

const srCreateDocReferenceWithStickyNote = async (
  trx: Transaction, snrStickyNoteId?: string, snrRecordTypeEntityTypeId?: string,
): Promise<void> => {
  if (snrRecordTypeEntityTypeId && snrStickyNoteId) {
    if (!(await DoRecordTypeEntityType.findOneByCol(trx, "rtetId", snrRecordTypeEntityTypeId))?.rtetId) {
      throw new MdUnprocessableEntityError(RECORD_FILE_NOT_FOUND);
    }
    await DoStickyNoteRef.insertOne(trx, { snrRecordTypeEntityTypeId, snrStickyNoteId });
  }
};

class SrStickyNotes {
  static srGetUsersStickyNotesQb(
    trx: Transaction,
    userId: string,
    filterMethod: tpStickyNotesStatus,
  ): QueryBuilder<tpStickyNotesData[]> {
    return DoStickyNotes.getUsersStickyNotesQb(trx, { userId, filterMethod });
  }

  static srGetAllStickyNotesQb(
    trx: Transaction, isItgAdmin: boolean, userInstances: string[],
  ): QueryBuilder<tpStickyNotesData[]> {
    return DoStickyNotes.getAllStickyNotesQueryQb(trx, isItgAdmin, userInstances);
  }

  static async createStickyNote(
    trx: Transaction,
    snFromUserId: string,
    stickyNote: tpStickyNoteBody,
  ): Promise<void> {
    if (stickyNote) {
      const {
        snBody, snSendAsEmail, snSubject, snToMySelf, snToUsers,
        snrRecordTypeEntityTypeId,
      } = stickyNote;

      const [createdSn] = await DoStickyNotes.insertOne(trx, {
        snFromUserId,
        snToMySelf,
        snBody,
        snSendAsEmail,
        snSubject,
        snStatus: STICKY_NOTE_STATUS.UNREAD,
        snType: stickyNote.snrRecordTypeEntityTypeId ? STICKY_NOTE_TYPE.WITH_REF : STICKY_NOTE_TYPE.GENERAL,
      });

      if (!createdSn?.snId) throw new MdUnprocessableEntityError(MSG_FAILED_SENDING_STICKY_NOTE);

      if (!stickyNote.snToMySelf) {
        const snUsers = snToUsers?.length > 0 ? snToUsers.map(({
          sntueInstanceId, sntueCompanyId, sntueToUserId,
        }) => ({
          sntueStickyNoteId: createdSn.snId,
          sntueInstanceId,
          sntueCompanyId,
          sntueToUserId,
        })) : [];
        await DoStickyNoteTousersEntity.insertMany(trx, snUsers);
      }

      await srCreateDocReferenceWithStickyNote(trx, createdSn.snId, snrRecordTypeEntityTypeId);
      return;
    }

    throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
  }

  static async getStickyNoteById(
    trx: Transaction,
    snId?: string,
  ): Promise<MdStickyNotes> {
    if (snId) {
      const note = await DoStickyNotes.findOneByCol(trx, "snId", snId);
      if (!note) throw new MdUnprocessableEntityError(MSG_STICKY_NOTES_NOT_FOUND);
      return note;
    }
    throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
  }

  static async updateStickyNoteStatus(
    trx: Transaction,
    snId?: string,
    value?: tpStickyNotesStatus,

  ): Promise<void> {
    if (!snId || !value) throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
    const note = await DoStickyNotes.findOneByCol(trx, "snId", snId);
    if (!note) throw new MdUnprocessableEntityError(MSG_STICKY_NOTES_NOT_FOUND);

    await DoStickyNotes.updateOneByColName(trx, {
      snStatus: value,
    }, "snId", snId);
  }

  static async deleteStickyNote(
    trx: Transaction,
    snId?: string,
  ): Promise<void> {
    if (!snId) throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
    const note = await DoStickyNotes.findOneByCol(trx, "snId", snId);
    if (!note) throw new MdUnprocessableEntityError(MSG_STICKY_NOTES_NOT_FOUND);
    await DoStickyNotes.deleteOneByCol(trx, "snId", snId);
  }
}

export default SrStickyNotes;
