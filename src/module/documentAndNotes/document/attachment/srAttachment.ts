import { Transaction } from "knex";
import DoAttachment from "./doAttachment";
import DoAttachmentValidity from "../attachmentValidity/doAttachmentValidity";
import DoAttachmentDescription from "../attachmentDescription/doAttachmentDescription";
import DoAttachmentFile from "../attachmentFile/doAttachmentFile";
import DoDocAndNoteType from "../../docAndNoteType/doDocAndNoteType";
import { srGetRecordTypeEntityType } from "../../notes/note/srNote";
import MdUnprocessableEntityError from "../../../../base/errors/mdUnprocessableEntityError";
import {
  ERR_MSG_DOC_TYPE_NOT_EXISTS,
  ERR_MSG_DOC_VALIDITY_REQUIRED,
  ERR_MSG_NO_FILE_ADDED,
  ERR_MSG_RECORD_NOT_EXISTS,
} from "../../../shared/constants/dtOtherConstants";
import { tpDocumentAttachmentData } from "../../../shared/types/tpShared";

const srCheckIfDocTypeValidityRequired = async (
  trx: Transaction,
  docTypeId: string,
): Promise<boolean> => {
  const docType = await DoDocAndNoteType.findOneByCol(trx, "dntId", docTypeId);
  if (!docType) {
    throw new MdUnprocessableEntityError(ERR_MSG_DOC_TYPE_NOT_EXISTS);
  }
  return docType.dntIsValidityRequired === true;
};

const srInsertAttachmentData = async (
  trx: Transaction,
  docAdvanceAttachmentData:
  Pick <tpDocumentAttachmentData, "aId" | "adDescription" | "afFileId" | "avValidityStartDate" | "avValidityEndDate">,
): Promise<void> => {
  const {
    aId,
    adDescription,
    avValidityStartDate,
    avValidityEndDate,
    afFileId,
  } = docAdvanceAttachmentData;
  await DoAttachmentDescription.insertOne(trx, { adAttachmentId: aId, adDescription });
  await DoAttachmentValidity.insertOne(trx, {
    avAttachmentId: aId,
    avValidityStartDate,
    avValidityEndDate,
  });
  if (afFileId?.length > 0) {
    afFileId.map((fileId) => DoAttachmentFile.insertOne(trx, { afAttachmentId: aId, afFileId: fileId }));
  } else throw new MdUnprocessableEntityError(ERR_MSG_NO_FILE_ADDED);
};

class SrAttachment {
  static async addAttachment(
    trx: Transaction,
    attachmentData: tpDocumentAttachmentData,
    userId: string,
  ): Promise<tpDocumentAttachmentData> {
    const {
      recordId,
      aDocTypeId,
      aScope,
      adDescription,
      afFileId,
      avValidityStartDate,
      avValidityEndDate,
    } = attachmentData;
    if (await srCheckIfDocTypeValidityRequired(trx, aDocTypeId)) {
      if (!avValidityStartDate || !avValidityEndDate) {
        throw new MdUnprocessableEntityError(ERR_MSG_DOC_VALIDITY_REQUIRED);
      }
    }
    const rtetId = await srGetRecordTypeEntityType(trx, recordId);
    if (!rtetId) {
      throw new MdUnprocessableEntityError(ERR_MSG_RECORD_NOT_EXISTS);
    }
    const [newAttachment] = await DoAttachment.insertOne(trx, {
      aDocTypeId,
      aRecordTypeEntityTypeId: rtetId,
      aCreatedByUserId: userId,
      aScope,
    });
    await srInsertAttachmentData(trx, {
      aId: newAttachment.aId,
      adDescription,
      avValidityStartDate,
      avValidityEndDate,
      afFileId,
    });

    return {
      ...newAttachment,
      adDescription,
      afFileId,
      recordId,
    };
  }
}

export default SrAttachment;
