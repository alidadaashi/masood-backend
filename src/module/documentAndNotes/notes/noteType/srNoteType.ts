import { Transaction } from "knex";
import { srBuildFilterCriteria } from "../../../shared/services/filters/srFilter";
import { GridFilterStateType } from "../../../shared/types/tpFilter";
import { utCountTotalByQb } from "../../../shared/utils/utData";
import { tpDocumentTypeData } from "../../../shared/types/tpShared";
import DoDocAndNoteType from "../../docAndNoteType/doDocAndNoteType";
import MdDocAndNoteType from "../../docAndNoteType/mdDocAndNoteType";
import MdUnprocessableEntityError from "../../../../base/errors/mdUnprocessableEntityError";
import {
  MSG_MAIN_NOTE_TYPE_CANNOT_BE_ADDED,
  MSG_MAIN_NOTE_TYPE_CANNOT_BE_DELETED,
  MSG_MAIN_NOTE_TYPE_CANNOT_BE_UPDATED,
  MSG_NOTE_MAIN_TYPE_NOT_EXISTS,
  MSG_NOTE_TYPE_ALREADY_EXISTS_FOR_INSTANCE,
  MSG_NOTE_TYPE_ALREADY_EXISTS_FOR_COMPANY,
  MSG_NOTE_EXISTS_WITH_TYPE_CANNOT_BE_DELETED,
  MSG_NOTE_TYPE_NAME_CANNOT_BE_EMPTY,
  MSG_NOTE_TYPE_NOT_EXISTS,
  MSG_SELECT_ATLEAST_ONE_INSTANCE,

} from "../../../shared/constants/dtOtherConstants";
import DoDocAndNoteTypeInstance from "../../docAndNoteTypeInstance/doDocAndNoteTypeInstance";
import MdDocAndNoteTypeInstance from "../../docAndNoteTypeInstance/mdDocAndNoteTypeInstance";
import knex from "../../../../base/database/cfgKnex";
import { utGetAllDataIdsArray } from "../../../shared/utils/utFilter";
import MdDocAndNoteTypeCompany from "../../docAndNoteTypeCompany/mdDocAndNoteTypeCompany";
import DoDocAndNoteTypeCompany from "../../docAndNoteTypeCompany/doDocAndNoteTypeCompany";
import { NOTE_TYPE } from "../../../shared/data/dtSysDefDocAndNoteTypes";
import DoNote from "../note/doNote";

const srAddInstance = async (
  trx: Transaction,
  ntInstance: string[],
  isForAllCompanies: boolean,
  dntId: string,
) => {
  const instanceData: MdDocAndNoteTypeInstance[] = ntInstance.map((instance) => ({
    dntiDocOrNoteTypeId: dntId as string,
    dntiInstanceId: instance,
    dntiIsForAllCompanies: isForAllCompanies,
  }));
  await DoDocAndNoteTypeInstance.insertMany(trx, instanceData);
};
const srUpdateInstance = async (
  trx: Transaction,
  ntInstance: string[],
  isForAllCompanies: boolean,
  dntId: string,
) => {
  await DoDocAndNoteTypeInstance.deleteManyByCol(trx, "dntiDocOrNoteTypeId", dntId);
  const instanceData: MdDocAndNoteTypeInstance[] = ntInstance.map((instance) => ({
    dntiDocOrNoteTypeId: dntId as string,
    dntiInstanceId: instance,
    dntiIsForAllCompanies: isForAllCompanies,
  }));
  await DoDocAndNoteTypeInstance.insertMany(trx, instanceData);
};

const srAddCompany = async (
  trx: Transaction,
  ntCompany: string[],
  dntId: string,
) => {
  const companyData: MdDocAndNoteTypeCompany[] = ntCompany.map((company) => ({
    dntcDocOrNoteTypeId: dntId as string,
    dntcCompanyId: company,
  }));
  await DoDocAndNoteTypeCompany.insertMany(trx, companyData);
};
const srUpdateCompany = async (
  trx: Transaction,
  ntCompany: string[],
  dntId: string,
) => {
  await DoDocAndNoteTypeCompany.deleteManyByCol(trx, "dntcDocOrNoteTypeId", dntId);
  await srAddCompany(trx, ntCompany, dntId);
};
const srCheckExistingTypeNameInInstances = async (
  trx: Transaction,
  subTypeData: tpDocumentTypeData,
  ntInstance: string[],
): Promise<void> => {
  const checkInstance = ntInstance.map(async (instanceId) => {
    const noteTypes = await DoDocAndNoteTypeInstance.findAllByCol(trx, "dntiInstanceId", instanceId);
    const checkNoteName = noteTypes.map(async (noteType) => {
      const singleNoteType = await DoDocAndNoteType.findOneByPredicate(trx, {
        dntId: noteType.dntiDocOrNoteTypeId,
        dntName: subTypeData.dntSubType,
        dntType: NOTE_TYPE,
      });
      if (singleNoteType) {
        throw new MdUnprocessableEntityError(MSG_NOTE_TYPE_ALREADY_EXISTS_FOR_INSTANCE);
      }
    });
    await Promise.all(checkNoteName);
  });
  await Promise.all(checkInstance);
};
const srCheckExistingTypeNameInCompanies = async (
  trx: Transaction,
  subTypeData: tpDocumentTypeData,
  ntCompany: string[],
): Promise<void> => {
  const checkCompany = ntCompany.map(async (companyId) => {
    const noteTypes = await DoDocAndNoteTypeCompany.findAllByCol(trx, "dntcCompanyId", companyId);
    const checkNoteName = noteTypes.map(async (noteType) => {
      const singleNoteType = await DoDocAndNoteType.findOneByPredicate(trx, {
        dntId: noteType.dntcDocOrNoteTypeId,
        dntName: subTypeData.dntSubType,
        dntType: NOTE_TYPE,
      });
      if (singleNoteType) {
        throw new MdUnprocessableEntityError(MSG_NOTE_TYPE_ALREADY_EXISTS_FOR_COMPANY);
      }
    });
    await Promise.all(checkNoteName);
  });
  await Promise.all(checkCompany);
};
const srCheckForExistingSubTypeName = async (
  trx: Transaction,
  subTypeData: tpDocumentTypeData,
): Promise<void> => {
  if (subTypeData.dntInstance && subTypeData.dntInstance.length > 0) {
    if (subTypeData.dntCompany && subTypeData.dntCompany.length > 0) {
      await srCheckExistingTypeNameInCompanies(trx, subTypeData, subTypeData.dntCompany);
    } else if (!subTypeData.dntCompany || subTypeData.dntCompany.length === 0) {
      await srCheckExistingTypeNameInInstances(trx, subTypeData, subTypeData.dntInstance);
    }
  }
};

const srCheckForInstanceAndCompany = async (
  trx:Transaction,
  subTypeData:tpDocumentTypeData,
):Promise<void> => {
  const noteType = await DoDocAndNoteType.findOneByCol(trx, "dntId", subTypeData.dntId);
  if (subTypeData.dntInstance) {
    if (subTypeData.dntInstance.length > 0) {
      await srCheckExistingTypeNameInInstances(trx,
        { ...subTypeData, dntSubType: noteType.dntName as string }, subTypeData.dntInstance);
    } else throw new MdUnprocessableEntityError(MSG_SELECT_ATLEAST_ONE_INSTANCE);
  }
  if (subTypeData.dntCompany) {
    if (subTypeData.dntCompany.length > 0) {
      await srCheckExistingTypeNameInCompanies(trx,
        { ...subTypeData, dntSubType: noteType.dntName as string }, subTypeData.dntCompany);
    }
  }
};
const srCheckForExistingSubTypeNameUpdate = async (
  trx: Transaction,
  subTypeData: tpDocumentTypeData,
): Promise<void> => {
  if (subTypeData.dntSubType) {
    const instanceIds = await DoDocAndNoteTypeInstance.findAllByPredicatePickField(trx, {
      dntiDocOrNoteTypeId: subTypeData.dntId,
    }, "dntiInstanceId");
    if (instanceIds.length > 0) await srCheckExistingTypeNameInInstances(trx, subTypeData, instanceIds);
    const companiesIds = await DoDocAndNoteTypeCompany.findAllByPredicatePickField(trx, {
      dntcDocOrNoteTypeId: subTypeData.dntId,
    }, "dntcCompanyId");
    if (companiesIds.length > 0) await srCheckExistingTypeNameInCompanies(trx, subTypeData, companiesIds);
  }
  await srCheckForInstanceAndCompany(trx, subTypeData);
};
const srUpdateNoteType = async (
  trx: Transaction,
  subTypeData: tpDocumentTypeData,
  note: MdDocAndNoteType,
  ntId: string,
) => {
  await srCheckForExistingSubTypeNameUpdate(trx, subTypeData);
  const [noteSubType] = await DoDocAndNoteType.updateOneByColName(trx, {
    dntName: subTypeData.dntSubType ? subTypeData.dntSubType : note.dntName,
    dntIsActive: subTypeData.dntIsActive,
    dntParentTypeId: subTypeData.dntParentTypeId ? subTypeData.dntParentTypeId : note.dntParentTypeId,
    dntHierarchyType: subTypeData.dntHierarchyType ? subTypeData.dntHierarchyType : note.dntHierarchyType,
  }, "dntId", ntId);
  return noteSubType;
};

const srAddNoteSubType = async (
  trx: Transaction,
  subTypeData: tpDocumentTypeData,

): Promise<MdDocAndNoteType> => {
  const [noteSubType] = await DoDocAndNoteType.insertOne(trx, {
    dntDefinedType: subTypeData.dntDefinedType,
    dntType: "note",
    dntName: subTypeData.dntSubType,
    dntIsActive: subTypeData.dntIsActive,
    dntParentTypeId: subTypeData.dntParentTypeId,
    dntHierarchyType: subTypeData.dntHierarchyType,
  });
  return noteSubType;
};
const srAddInstanceAndCompanies = async (
  trx: Transaction,
  subTypeData: tpDocumentTypeData,
  noteSubType: MdDocAndNoteType,
): Promise<void> => {
  if (subTypeData.dntInstance && subTypeData.dntInstance?.length > 0) {
    const isForAllCompanies = !!((!subTypeData.dntCompany || subTypeData.dntCompany.length === 0));
    await srAddInstance(trx, subTypeData.dntInstance, isForAllCompanies, noteSubType.dntId as string);
  } else throw new MdUnprocessableEntityError(MSG_SELECT_ATLEAST_ONE_INSTANCE);
  if (subTypeData.dntCompany && subTypeData.dntCompany.length > 0) {
    await srAddCompany(trx, subTypeData.dntCompany, noteSubType.dntId as string);
  }
};

const srUpdateInstanceAndCompanies = async (
  trx: Transaction,
  data: tpDocumentTypeData,
): Promise<void> => {
  if (data.dntInstance && data.dntInstance.length > 0) {
    const isForAllCompanies = !!((!data.dntCompany || data.dntCompany.length === 0));
    await srUpdateInstance(trx, data.dntInstance, isForAllCompanies, data.dntId as string);
  } else if (data.dntInstance && data.dntInstance.length === 0) {
    throw new MdUnprocessableEntityError(MSG_SELECT_ATLEAST_ONE_INSTANCE);
  }
  if (data.dntCompany && data.dntCompany.length > 0) {
    await srUpdateCompany(trx, data.dntCompany, data.dntId as string);
  }
};
class SrNoteType {
  static async getAllNoteTypes(
    trx: Transaction,
    filters: GridFilterStateType,
  ): Promise<{ data: tpDocumentTypeData[], total: number, allIds: string[] }> {
    const isSelectAllRows = (filters.isSelectAllRows as unknown as string === "true");
    const getAllNotesQb = DoDocAndNoteType.getAllDocAndNoteType(trx, "note");
    const allNoteTypesWrappedQb = knex.select("*").from(getAllNotesQb.as("SUBQ"));
    const qbWithFilters = srBuildFilterCriteria(allNoteTypesWrappedQb, filters, undefined, false);
    const data = await qbWithFilters;
    const total = data.length ? await utCountTotalByQb(qbWithFilters) : 0;
    const allIds = isSelectAllRows ? await utGetAllDataIdsArray(trx, getAllNotesQb, "dntId") : [];
    return { data, total, allIds };
  }

  static async addNoteSubType(
    trx: Transaction,
    subTypeData: tpDocumentTypeData,
  ): Promise<MdDocAndNoteType> {
    if (subTypeData.dntHierarchyType === "main") {
      throw new MdUnprocessableEntityError(MSG_MAIN_NOTE_TYPE_CANNOT_BE_ADDED);
    }
    if (!subTypeData.dntSubType) throw new MdUnprocessableEntityError(MSG_NOTE_TYPE_NAME_CANNOT_BE_EMPTY);

    if (!await DoDocAndNoteType.findOneByCol(trx, "dntId", subTypeData.dntParentTypeId)) {
      throw new MdUnprocessableEntityError(MSG_NOTE_MAIN_TYPE_NOT_EXISTS);
    }
    await srCheckForExistingSubTypeName(trx, subTypeData);
    const noteSubType = await srAddNoteSubType(trx, subTypeData);
    await srAddInstanceAndCompanies(trx, subTypeData, noteSubType);
    return noteSubType;
  }

  static async updateNoteSubType(
    trx: Transaction,
    subTypeData: tpDocumentTypeData[],
  ): Promise<void> {
    const updatedNoteSubTypeData = subTypeData.map(async (data) => {
      if (data.dntSubType) {
        if (!data.dntSubType) throw new MdUnprocessableEntityError(MSG_NOTE_TYPE_NAME_CANNOT_BE_EMPTY);
      }
      const noteType = await DoDocAndNoteType.findOneByCol(trx, "dntId", data.dntId);
      if (!noteType) throw new MdUnprocessableEntityError(MSG_NOTE_TYPE_NOT_EXISTS);

      if (noteType.dntHierarchyType === "main") throw new MdUnprocessableEntityError(MSG_MAIN_NOTE_TYPE_CANNOT_BE_UPDATED);

      await srUpdateNoteType(trx, data, noteType, data.dntId);
      if (data.dntInstance || data.dntCompany) {
        await srUpdateInstanceAndCompanies(trx, data);
      }
    });
    await Promise.all(updatedNoteSubTypeData);
  }

  static async deleteNoteSubType(
    trx: Transaction,
    ntId: string,
  ): Promise<void> {
    const noteType = await DoDocAndNoteType.findOneByCol(trx, "dntId", ntId);
    if (!noteType) throw new MdUnprocessableEntityError(MSG_NOTE_TYPE_NOT_EXISTS);

    if (noteType.dntHierarchyType === "main") {
      throw new MdUnprocessableEntityError(MSG_MAIN_NOTE_TYPE_CANNOT_BE_DELETED);
    }
    const notes = await DoNote.findOneByCol(trx, "nNoteTypeId", ntId);
    if (notes) throw new MdUnprocessableEntityError(MSG_NOTE_EXISTS_WITH_TYPE_CANNOT_BE_DELETED);

    await DoDocAndNoteTypeInstance.deleteManyByCol(trx, "dntiDocOrNoteTypeId", ntId);
    await DoDocAndNoteTypeCompany.deleteManyByCol(trx, "dntcDocOrNoteTypeId", ntId);
    await DoDocAndNoteType.deleteOneByCol(trx, "dntId", ntId);
  }
}

export default SrNoteType;
