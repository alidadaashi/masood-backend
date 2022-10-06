import { Transaction } from "knex";
import {
  tpDocumentOrigin, tpDocumentTypeParams, tpDocumentTypeData, tpAddDocumentType, tpUpdateDocumentType,
} from "../../../shared/types/tpShared";
import { srBuildFilterCriteria } from "../../../shared/services/filters/srFilter";
import { GridFilterStateType } from "../../../shared/types/tpFilter";
import { utCountTotalByQb } from "../../../shared/utils/utData";
import MdUnprocessableEntityError from "../../../../base/errors/mdUnprocessableEntityError";
import {
  DOC_AND_NOTE_TYPE_DOCUMENT,
  ERR_ATTACHMENT_EXISTS_WITH_TYPE_CANNOT_BE_DELETED,
  ERR_DOCUMENT_TYPE_COMPANY_UNRELATED_TO_SELECTED_INSTANCE,
  ERR_DOCUMENT_TYPE_EMPTY_NAME, ERR_DOCUMENT_TYPE_INVALID_COMPANY_ID, ERR_DOCUMENT_TYPE_INVALID_PARENT_ID,
  ERR_DOCUMENT_TYPE_NAME_ALREADY_EXISTS, ERR_DOCUMENT_TYPE_NOT_EXISTS,
  ERR_DOCUMENT_TYPE_NO_INSTANCE, ERR_SUB_TYPE_EXISTS_WITH_TYPE_CANNOT_BE_DELETED,
  MESSAGE_PERMISSION_DENIED, SYSTEM_DEFINED_DOCUMENT_TYPES_KEY,
} from "../../../shared/constants/dtOtherConstants";
import DoDocAndNoteType from "../../docAndNoteType/doDocAndNoteType";
import DoDocAndNoteTypeInstance from "../../docAndNoteTypeInstance/doDocAndNoteTypeInstance";
import MdDocAndNoteTypeInstance from "../../docAndNoteTypeInstance/mdDocAndNoteTypeInstance";
import MdDocAndNoteType from "../../docAndNoteType/mdDocAndNoteType";
import { utGetAllDataIdsArray } from "../../../shared/utils/utFilter";
import DoDocAndNoteTypeCompany from "../../docAndNoteTypeCompany/doDocAndNoteTypeCompany";
import MdDocAndNoteTypeCompany from "../../docAndNoteTypeCompany/mdDocAndNoteTypeCompany";
import DoAttachment from "../attachment/doAttachment";
import DoCompanyDetails from "../../../entities/company/doCompanyDetails";

export const srCheckValidHierarchyType = (
  dtData: tpAddDocumentType,
): void => {
  const origin: tpDocumentOrigin = dtData.dntDefinedType ?? "system-defined";
  if (origin === "system-defined" || !dtData.dntDefinedType) {
    throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
  }
};

const srAddInstance = async (trx: Transaction, dntInstance: string[], dntId: string) => {
  const instanceData: MdDocAndNoteTypeInstance[] = dntInstance.map((instance) => ({
    dntiDocOrNoteTypeId: dntId as string,
    dntiInstanceId: instance,
    dntiIsForAllCompanies: true,
  }));
  await DoDocAndNoteTypeInstance.insertMany(trx, instanceData);
};

const srAddCompany = async (trx: Transaction, dntCompany: string[], dntId: string) => {
  const companyData: MdDocAndNoteTypeCompany[] = dntCompany.map((company) => ({
    dntcDocOrNoteTypeId: dntId as string, dntcCompanyId: company,
  }));
  await DoDocAndNoteTypeCompany.insertMany(trx, companyData);
};

const srGetInstanceData = async (
  trx:Transaction, dtData: tpUpdateDocumentType,
): Promise<string[]> => {
  let instances: string[] = [];
  if (dtData.dntInstance && dtData.dntInstance.length > 0) instances = dtData.dntInstance;
  else if (dtData.dntId) {
    const dbInstances = await DoDocAndNoteTypeInstance.findAllByCol(trx, "dntiDocOrNoteTypeId", dtData.dntId);
    if (dbInstances && dbInstances.length) instances = dbInstances.map((instance) => instance.dntiInstanceId);
  }
  return instances;
};

const srGetCompanyData = async (
  trx:Transaction, dtData: tpUpdateDocumentType,
): Promise<string[]> => {
  let companies: string[] = [];
  if (dtData.dntCompany && dtData.dntCompany.length > 0) companies = dtData.dntCompany;
  else if (dtData.dntId) {
    const dbCompanies = await DoDocAndNoteTypeCompany.findAllByCol(trx, "dntcDocOrNoteTypeId", dtData.dntId);
    if (dbCompanies && dbCompanies.length) companies = dbCompanies.map((instance) => instance.dntcCompanyId);
  }
  return companies;
};

const srCheckExistingOrNewInstanceCompany = async (
  trx: Transaction, dtData: tpUpdateDocumentType,
): Promise<{instances: string[], companies: string[]}> => {
  const instances = await srGetInstanceData(trx, dtData);
  const companies = await srGetCompanyData(trx, dtData);

  return { instances, companies };
};

const srCheckUserDefDocInstanceCompany = async (
  trx: Transaction, dtData: tpAddDocumentType,
) => {
  if (!dtData.dntInstance?.length) {
    throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_NO_INSTANCE);
  }
  const document = await DoDocAndNoteType.findOneByPredicate(trx, {
    dntName: dtData.dntName,
    dntDefinedType: "user-defined",
    dntType: DOC_AND_NOTE_TYPE_DOCUMENT,
  });
  if (document) {
    const instances = dtData.dntInstance ?? [];
    await Promise.all(instances.map(async (instanceId) => {
      const instance = await DoDocAndNoteTypeInstance.findOneByPredicate(trx,
        { dntiDocOrNoteTypeId: document.dntId as string, dntiInstanceId: instanceId });
      if (instance) throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_NAME_ALREADY_EXISTS);
    }));
    if (dtData.dntCompany?.length) {
      const companies = dtData.dntCompany ?? [];
      await Promise.all(companies.map(async (companyId) => {
        const company = await DoDocAndNoteTypeCompany.findOneByPredicate(trx,
          { dntcDocOrNoteTypeId: document.dntId as string, dntcCompanyId: companyId });
        if (company) throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_NAME_ALREADY_EXISTS);
      }));
    }
  }
};

export const srCheckUserDefDocInstanceCompanyRelation = async (
  trx: Transaction, dtData: tpUpdateDocumentType,
): Promise<void> => {
  const { instances, companies } = await srCheckExistingOrNewInstanceCompany(trx, dtData);
  await Promise.all(companies.map(async (companyId) => {
    const companyDetails = await DoCompanyDetails.findOneByCol(trx, "cEntityId", companyId);
    if (!companyDetails) throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_INVALID_COMPANY_ID);
    if (instances.indexOf(companyDetails.cInstanceEntityId) === -1) {
      if (dtData.dntId) {
        const company = await DoDocAndNoteTypeCompany.findOneByPredicate(trx, {
          dntcDocOrNoteTypeId: dtData.dntId, dntcCompanyId: companyId,
        });
        if (company) await DoDocAndNoteTypeCompany.deleteOneByCol(trx, "dntcId", company.dntcId as string);
      } else throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_COMPANY_UNRELATED_TO_SELECTED_INSTANCE);
    }
  }));
};

export const srCheckExistingOrEmptyName = async (
  trx: Transaction, dtData: tpAddDocumentType,
): Promise<void> => {
  if (!dtData.dntName || dtData.dntName === "") throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_EMPTY_NAME);
  if (dtData.dntHierarchyType === "sub-type") {
    if (!dtData.dntParentTypeId) throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_INVALID_PARENT_ID);
    const parentDocument = await DoDocAndNoteType.findOneByCol(trx, "dntId", dtData.dntParentTypeId as string);
    if (!parentDocument) throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_INVALID_PARENT_ID);
    if (parentDocument.dntDefinedType === "system-defined") {
      const document = await DoDocAndNoteType.findOneByPredicate(trx, { dntName: dtData.dntName, dntType: "document" });
      if (document) throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_NAME_ALREADY_EXISTS);
    }
  }
};

const srUpdateUserDefDocTypesInstanceAndCompany = async (
  trx: Transaction, data: tpUpdateDocumentType,
): Promise<void> => {
  if (data.dntInstance) {
    if (!data.dntInstance.length) throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_NO_INSTANCE);
    else {
      await DoDocAndNoteTypeInstance.deleteManyByCol(trx, "dntiDocOrNoteTypeId", data.dntId);
      await srAddInstance(trx, data.dntInstance, data.dntId as string);
    }
  }
  if (data.dntCompany) {
    await DoDocAndNoteTypeCompany.deleteManyByCol(trx, "dntcDocOrNoteTypeId", data.dntId);
    if (data.dntCompany.length) await srAddCompany(trx, data.dntCompany, data.dntId as string);
  }
};

const srDeleteUserDefDocTypesInstanceAndCompany = async (
  trx: Transaction, deleteIds: string[],
): Promise<void> => {
  const deleteUserDefDocTypes = deleteIds.map(async (dntId) => {
    await DoDocAndNoteTypeInstance.deleteManyByCol(trx, "dntiDocOrNoteTypeId", dntId);
    await DoDocAndNoteTypeCompany.deleteManyByCol(trx, "dntcDocOrNoteTypeId", dntId);
    await DoDocAndNoteType.deleteOneByCol(trx, "dntId", dntId);
  });
  await Promise.all(deleteUserDefDocTypes);
};

export const srCheckUserDefDocTypesNameForUpdate = async (
  trx: Transaction, dtData: tpUpdateDocumentType,
): Promise<void> => {
  const { instances, companies } = await srCheckExistingOrNewInstanceCompany(trx, dtData);
  if (dtData.dntName !== undefined) {
    await srCheckExistingOrEmptyName(trx, dtData as tpAddDocumentType);
    await srCheckUserDefDocInstanceCompany(trx, {
      ...dtData, dntName: dtData.dntName, dntInstance: instances, dntCompany: companies,
    } as tpAddDocumentType);
  } else {
    const document = await DoDocAndNoteType.findOneByCol(trx, "dntId", dtData.dntId);
    if (document) {
      await srCheckUserDefDocInstanceCompany(trx, {
        ...dtData, dntName: document.dntName, dntInstance: instances, dntCompany: companies,
      } as tpAddDocumentType);
    }
  }
};

export const srGetExistingDocType = async (
  trx: Transaction, dntId: string,
): Promise<MdDocAndNoteType | undefined> => {
  const documentType = await DoDocAndNoteType.findOneByCol(trx, "dntId", dntId);
  if (!documentType) throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_NOT_EXISTS);
  return documentType;
};

const srFormatReqDataForUpdate = (
  dtData: tpUpdateDocumentType, origin: tpDocumentOrigin,
): tpUpdateDocumentType => {
  const data: tpUpdateDocumentType = { dntId: dtData.dntId };
  if (dtData.dntIsActive !== undefined && origin === "user-defined") {
    Object.assign(data, { dntIsActive: dtData.dntIsActive });
  }
  if (dtData.dntName !== undefined && origin === "user-defined") Object.assign(data, { dntName: dtData.dntName });
  if (dtData.dntIsPrivNeeded !== undefined) Object.assign(data, { dntIsPrivNeeded: dtData.dntIsPrivNeeded });
  if (dtData.dntIsValidityRequired !== undefined) {
    Object.assign(data, { dntIsValidityRequired: dtData.dntIsValidityRequired });
  }

  return data;
};

class SrDocumentType {
  static async getAllDocumentTypes(
    trx: Transaction, filters: GridFilterStateType, docOrigin: tpDocumentTypeParams,
  ): Promise<{ data: tpDocumentTypeData[], total: number, allIds: string[] }> {
    const origin: tpDocumentOrigin = docOrigin ?? "system-defined";
    const isSelectAllRows = (filters.isSelectAllRows as unknown as string === "true");
    const getAllDocumentsQb = DoDocAndNoteType.getAllDocAndNoteType(trx, "document", origin);
    const qbWithFilters = srBuildFilterCriteria(getAllDocumentsQb, filters, undefined, false);
    const data = await qbWithFilters;
    const total = data.length ? await utCountTotalByQb(qbWithFilters) : 0;
    const allIds = isSelectAllRows ? await utGetAllDataIdsArray(trx, getAllDocumentsQb, "dntId") : [];
    return { data, total, allIds };
  }

  static async addSysDefDocumentTypes(
    trx: Transaction, dtData: tpAddDocumentType,
  ): Promise<MdDocAndNoteType> {
    const [docSubType] = await DoDocAndNoteType.insertOne(trx, {
      dntDefinedType: dtData.dntDefinedType,
      dntType: DOC_AND_NOTE_TYPE_DOCUMENT,
      dntName: dtData.dntName,
      dntIsActive: dtData.dntIsActive ?? true,
      dntParentTypeId: dtData.dntParentTypeId,
      dntHierarchyType: dtData.dntHierarchyType,
    });
    return docSubType;
  }

  static async addUserDefDocumentTypes(
    trx: Transaction, dtData: tpAddDocumentType,
  ): Promise<MdDocAndNoteType> {
    await srCheckUserDefDocInstanceCompany(trx, dtData);
    await srCheckUserDefDocInstanceCompanyRelation(trx, dtData as tpUpdateDocumentType);
    const [docSubType] = await DoDocAndNoteType.insertOne(trx, {
      dntDefinedType: dtData.dntDefinedType,
      dntType: DOC_AND_NOTE_TYPE_DOCUMENT,
      dntName: dtData.dntName,
      dntIsActive: dtData.dntIsActive ?? true,
      dntParentTypeId: dtData.dntParentTypeId,
      dntHierarchyType: dtData.dntHierarchyType,
    });
    await srAddInstance(trx, dtData?.dntInstance as string[], docSubType?.dntId as string);
    if (dtData.dntCompany && dtData.dntCompany.length) {
      await srAddCompany(trx, dtData?.dntCompany as string[], docSubType?.dntId as string);
    }
    return docSubType;
  }

  static async updateSysDefDocumentTypes(
    trx: Transaction, dtData: tpUpdateDocumentType[],
  ): Promise<MdDocAndNoteType[]> {
    const updatedList: MdDocAndNoteType[] = [];
    const updatedDocumentTypeData = dtData.map(async (data) => {
      const existingType = await srGetExistingDocType(trx, data.dntId);
      const filteredReqData = srFormatReqDataForUpdate(data, "system-defined");
      if (filteredReqData.dntName !== undefined) {
        await srCheckExistingOrEmptyName(trx,
          { ...existingType, dntName: filteredReqData.dntName } as tpAddDocumentType);
      }
      const [documentType] = await DoDocAndNoteType.updateOneByColName(trx, filteredReqData, "dntId", data.dntId);
      updatedList.push(documentType);
    });
    await Promise.all(updatedDocumentTypeData);
    return updatedList;
  }

  static async updateUserDefDocumentTypes(
    trx: Transaction, dtData: tpUpdateDocumentType[],
  ): Promise<MdDocAndNoteType[]> {
    const updatedList: MdDocAndNoteType[] = [];
    const updatedDocumentTypeData = dtData.map(async (data) => {
      await srGetExistingDocType(trx, data.dntId);
      const filteredReqData = srFormatReqDataForUpdate(data, "user-defined");
      await srCheckUserDefDocTypesNameForUpdate(trx, data as tpUpdateDocumentType);
      await srCheckUserDefDocInstanceCompanyRelation(trx, data);
      await srUpdateUserDefDocTypesInstanceAndCompany(trx, data);
      const [documentType] = await DoDocAndNoteType.updateOneByColName(trx, filteredReqData, "dntId", data.dntId);
      updatedList.push(documentType);
    });
    await Promise.all(updatedDocumentTypeData);
    return updatedList;
  }

  static async deleteDocumentTypes(
    trx: Transaction, deleteIds: string[],
  ): Promise<void> {
    const checkValidDeleteIds = deleteIds.map(async (dntId) => {
      const existingType = await srGetExistingDocType(trx, dntId);
      if (existingType) {
        if (existingType.dntDefinedType === SYSTEM_DEFINED_DOCUMENT_TYPES_KEY) {
          throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
        }
        if (existingType.dntHierarchyType === "main") {
          const documentChildType = await DoDocAndNoteType.findOneByCol(trx, "dntParentTypeId", dntId);
          if (documentChildType) throw new MdUnprocessableEntityError(ERR_SUB_TYPE_EXISTS_WITH_TYPE_CANNOT_BE_DELETED);
        }
      }
      const attachment = await DoAttachment.findOneByCol(trx, "aDocTypeId", dntId);
      if (attachment) throw new MdUnprocessableEntityError(ERR_ATTACHMENT_EXISTS_WITH_TYPE_CANNOT_BE_DELETED);
    });
    await Promise.all(checkValidDeleteIds);
    await srDeleteUserDefDocTypesInstanceAndCompany(trx, deleteIds);
  }
}

export default SrDocumentType;
