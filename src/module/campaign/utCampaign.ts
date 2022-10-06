import { Transaction } from "knex";
import { Request, Response, NextFunction } from "express";
import DoCampaign from "./doCampaign";
import MdGroupDetails from "../entities/group/mdGroupDetails";
import MdCampaign from "./mdCampaign";
import dtCampaignFieldDescriptor from "../shared/data/dtCampaignFieldDescriptor";
import MdCampaignField from "./campaignField/mdCampaignField";
import DoVendorSupplier from "../../vedi/module/vendorSupplier/DoVendorSupplier";
import MdCampaignSupplier from "./campaignSupplier/mdCampaignSupplier";
import doCampaignRecord from "./campaignRecord/doCampaignRecord";
import MdCampaignInstanceFieldRec from "./campSuppInstanceFieldRec/mdCampSuppInstanceFieldRec";
import doCampSuppInstanceFieldRec from "./campSuppInstanceFieldRec/doCampSuppInstanceFieldRec";
import doCampaignField from "./campaignField/doCampaignField";
import {
  tpCampaignsRecordKeys, tpCampaignApiData, tpCampaignsRecord,
  tpCampaignStatuses, tpGetAllCampaignFields,
} from "./tpCampaign";
import doCampaignSupplier from "./campaignSupplier/doCampaignSupplier";
import srCampaign from "./srCampaign";
import MdCampaignRecord from "./campaignRecord/mdCampaignRecord";
import { utReadExcelFile } from "../shared/utils/utExcel";
import { utGetSupplierEditableFields, utGetInstanceEditableFields } from "./campaignField/utCampaignFields";
import {
  CAMP_DETAIL_PROD_STATUS_FIELD_DESC_ID, CAMP_DETAIL_CATEGORY_COMMENT_FIELD_DESC_ID,
  dtCampaignEditableFields, CAMP_DETAIL_STATUS_FIELD_INITIAL_VAL,
  dtAllRequiredFieldsKeysForVendor, dtAllRequiredFieldsKeysForSupplier,
} from "../shared/data/dtCampaignFieldRecords";
import MdUnprocessableEntityError from "../../base/errors/mdUnprocessableEntityError";
import DoEntity from "../entity/doEntity";
import MdCampaignUserToken from "./campaignUserToken/mdCampaignUserToken";
import DoCreatorEntity from "../entities/creatorEntity/doCreatorEntity";
import { EntityTypes, UserSessionType } from "../shared/types/tpShared";
import {
  ERR_CAMPAIGN_EXPIRED, ERR_CAMPAIGN_INVALID_FIELDS, ERR_SUPP_CAMP_STATUS_CANNOT_BE_CHANGED,
  ERR_VENDOR_CAMP_STATUS_CANNOT_BE_CHANGED,
} from "../shared/constants/dtOtherConstants";
import { utIsValidFormattedDecimal } from "../shared/utils/utValidation";
import MdCampaignFieldDescriptor from "./campaignFieldDescriptor/mdCampaignFieldDescriptor";

export const utCreateCampaign = async (trx: Transaction, group: MdGroupDetails, creatorId: string): Promise<MdCampaign> => {
  const [{ entityId }] = await DoEntity.insertOne(trx, { entityType: "campaign" });
  const [campaign] = await DoCampaign.upsertMany(trx, {
    cEntityId: entityId,
    cCreator: creatorId,
    cDescription: "Camp 2",
    cTextNo: "123",
    cText: "Camp 2 Text",
    cReferenceText: "Camp 2 Reference Text",
    cInstanceId: group.gEntityId,
    cErpCode: "ERP-555",
    cCode: "555",
  }, ["cInstanceId", "cCode"]);

  return campaign;
};

const utMapExtApiDatatoMdCampaignFields = (campaignData: tpCampaignApiData) => ({
  cTextNo: campaignData.campaignsText,
  cCode: campaignData.campaignsCode,
  cErpCode: campaignData.campaignsErpCode,
  cReferenceText: campaignData.campaignsRefText,
  cDescription: campaignData.campaignsDescription,
  cText: campaignData.campaignsDescription,
  cStartDate: campaignData.campaignsStartDate,
  cEndDate: campaignData.campaignsEndDate,
  cReleaseDate: campaignData.campaignsReleaseDate,
  cDeadline: campaignData.campaignsDeadlineDate,
});

export const utUpsertCampaignByExternalSource = async (trx: Transaction, group: MdGroupDetails,
  campaignData: tpCampaignApiData, cutToken: MdCampaignUserToken): Promise<MdCampaign> => {
  if (campaignData.cpId) {
    const existingCampaign = await DoCampaign.findOneByCol(trx, "cId", campaignData.cpId);
    if (existingCampaign) {
      return existingCampaign;
    }
  }
  const [{ entityId }] = await DoEntity.insertOne(trx, { entityType: "campaign" });
  const [campaign] = await DoCampaign.upsertMany(trx, {
    cEntityId: entityId,
    cCreator: cutToken.cutEntityId,
    cInstanceId: group.gEntityId,
    ...utMapExtApiDatatoMdCampaignFields(campaignData),
  }, ["cInstanceId", "cCode"]);
  await DoCreatorEntity.insertOne(trx, {
    ceCreatorId: cutToken.cutEntityId,
    ceEntityId: campaign?.cEntityId,
    ceEntityType: "campaign",
  });
  return campaign;
};

export const utUpdateCampSuppStatusToNew = async (
  trx: Transaction, campaignId: string, csId: string, user: UserSessionType,
): Promise<void> => {
  const campSupp = await doCampaignSupplier.findOneByPredicate(trx, { csSupplierId: csId, csCampId: campaignId });
  if (campSupp && campSupp.csId) {
    await srCampaign.updateCampaignsStatus(trx, { status: "New", campSuppliersIds: [campSupp.csId] }, user);
  }
};

export const utCreateCampaignFieldRelation = async (trx: Transaction, campaign: MdCampaign): Promise<void> => {
  const dtCampaignFieldsRelation = dtCampaignFieldDescriptor.map((cf): MdCampaignField => ({
    cfCampId: campaign.cId as string,
    cfFieldDescriptorId: cf.cfdId as string,
    cfEditableBySupplier: dtCampaignEditableFields[cf.cfdName].editableBySupp || false,
    cfEditableByVendor: dtCampaignEditableFields[cf.cfdName].editableByInstance || false,
  }));
  await doCampaignField.upsertMany(trx, dtCampaignFieldsRelation, ["cfCampId", "cfFieldDescriptorId"]);
};

export const utCreateCampaignSupplierRelation = async (
  trx: Transaction, campaign: MdCampaign, group: MdGroupDetails, user: UserSessionType,
): Promise<void> => {
  const vendorSuppliers = await DoVendorSupplier.findAllByCol(trx, "vsVendorId", group.gEntityId);
  const dtCampaignSuppliers = vendorSuppliers.map((vs): MdCampaignSupplier => ({
    csCampId: campaign.cId as string,
    csSupplierId: vs.vsSupplierId,
    csStatus: "New",
  }));
  const allCampaignSuppliersIds = dtCampaignSuppliers.map((vs) => vs.csSupplierId);
  await Promise.all(allCampaignSuppliersIds.map((cs) => utUpdateCampSuppStatusToNew(trx, campaign.cId as string, cs, user)));
  await doCampaignSupplier.upsertMany(trx, dtCampaignSuppliers, ["csCampId", "csSupplierId"]);
};

const utTempRemoveOldRecordsAndFields = async (trx: Transaction) => {
  await trx(MdCampaignInstanceFieldRec.TABLE_NAME).delete();
  await trx(MdCampaignRecord.TABLE_NAME).delete();
};

export const utTempCreateCampaignInstanceFieldRecRelation = async (
  trx: Transaction, campaign: MdCampaign, campaignData: Record<string, string>[],
): Promise<void> => {
  await utTempRemoveOldRecordsAndFields(trx);

  const campaignFields = await doCampaignField.getCampaignAllFields(trx, campaign.cId as string);
  const campaignsPromises = campaignData.map(async (campData) => {
    const [campaignRecord] = await doCampaignRecord.insertOne(trx, { crCampId: campaign.cId });
    const campaignFieldsRecords = campaignFields.map((cf: tpGetAllCampaignFields): MdCampaignInstanceFieldRec => {
      const value = campData[cf.cfdName] || null;
      return {
        cifCampRecordId: campaignRecord.crId, cifCampFieldId: cf.cfId, cifValue: value,
      } as MdCampaignInstanceFieldRec;
    });
    await doCampSuppInstanceFieldRec.upsertMany(trx, campaignFieldsRecords, ["cifCampFieldId", "cifCampRecordId"]);
  });
  await Promise.all(campaignsPromises);
};

export const utCreateCampaignInstanceFieldRecRelationBySlug = async (
  trx: Transaction, campaign: MdCampaign, campaignData: tpCampaignsRecord[],
): Promise<void> => {
  const campaignFields = await doCampaignField.getCampaignAllFields(trx, campaign.cId as string);
  const campaignsPromises = campaignData.map(async (campData) => {
    const [campaignRecord] = await doCampaignRecord.insertOne(trx, { crCampId: campaign.cId });
    const campaignFieldsRecords = campaignFields.map((cf: tpGetAllCampaignFields): MdCampaignInstanceFieldRec => {
      let value = campData[cf.cfdSlug as tpCampaignsRecordKeys] || null;
      if (campData[cf.cfdSlug as tpCampaignsRecordKeys] === "frm__lbl__status") value = CAMP_DETAIL_STATUS_FIELD_INITIAL_VAL;
      return {
        cifCampRecordId: campaignRecord.crId, cifCampFieldId: cf.cfId, cifValue: value,
      } as MdCampaignInstanceFieldRec;
    });
    await doCampSuppInstanceFieldRec.upsertMany(trx, campaignFieldsRecords, ["cifCampFieldId", "cifCampRecordId"]);
  });
  await Promise.all(campaignsPromises);
};

export const utUpdateCampSuppStatusToViewed = async (
  trx: Transaction, csId: string, user: UserSessionType,
): Promise<void> => {
  const campSupp = await doCampaignSupplier.findOneByCol(trx, "csId", csId);
  if (campSupp && campSupp.csStatus === "New") {
    await srCampaign.updateCampaignsStatus(trx, { status: "Viewed", campSuppliersIds: [csId] }, user);
  }
};

const utCheckStatusForSupplierResp = (campaignSuppliersStatus: ("New" | "Submit for Approval"
  | "Withdraw From Approval" | "Cancel" | "Viewed" | "Confirm" | "Reject" | "Request Revision")[]):
  boolean | PromiseLike<boolean> => !(campaignSuppliersStatus.includes("Confirm")
    || campaignSuppliersStatus.includes("Cancel"));

const utGetStatus = (status: string) => status === "Withdraw From Approval" || status === "Submit for Approval"
  || status === "Confirm" || status === "Cancel" || status === "Request Revision";

export const utCanUpdateCampaignStatus = async (
  trx: Transaction, status: tpCampaignStatuses, campSuppliersIds: string[],
): Promise<boolean> => {
  if (utGetStatus(status)) {
    const campaignSuppliers = await doCampaignSupplier.findAllWhereColIn(trx, "csId", campSuppliersIds);
    if (campaignSuppliers?.length) {
      const campaignSuppliersStatus = campaignSuppliers.map((cs) => cs.csStatus);
      if (status === "Withdraw From Approval" || status === "Submit for Approval") {
        return utCheckStatusForSupplierResp(campaignSuppliersStatus);
      }
      return !(campaignSuppliersStatus.includes("Confirm") || campaignSuppliersStatus.includes("Cancel")
        || (campaignSuppliersStatus.includes("Request Revision")
          || campaignSuppliersStatus.includes("Withdraw From Approval")));
    }
  }
  return true;
};

export const utReadCampaignDetails = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const excelFile = req.file;
    if (excelFile) {
      req.body = utReadExcelFile(excelFile, true, { headerIndex: 1 });
      next();
    } else { throw new MdUnprocessableEntityError("Please upload the excel file"); }
  } catch (err) { next(err); }
};

export const utGetTransformedFieldData = async (
  trx: Transaction,
  campId: string,
  data: Record<string, string>[],
  entityType: "instance" | "supplier",
): Promise<Record<string, string>[]> => {
  const supplierEditableFields = entityType === "supplier"
    ? await utGetSupplierEditableFields(trx, campId)
    : await utGetInstanceEditableFields(trx, campId);
  const fieldIdAndValue = supplierEditableFields
    .reduce((accum, se) => ({ ...accum, [se.cfdSlug]: se.cfFieldDescriptorId }), {}) as (Record<string, string>);

  const fieldsData = data.map((di) => Object.keys(di).reduce((accum, diKey) => {
    if (diKey === "crId") return ({ ...accum, crId: di[diKey] });
    if (entityType === "instance" && diKey === "frm__lbl__category_comment") {
      return ({
        ...accum,
        [CAMP_DETAIL_CATEGORY_COMMENT_FIELD_DESC_ID]: di[diKey],
        [CAMP_DETAIL_PROD_STATUS_FIELD_DESC_ID]: di[diKey],
      });
    }
    const fieldId = fieldIdAndValue[diKey];
    if (fieldId) return ({ ...accum, [fieldId]: di[diKey] });
    return accum;
  }, {} as Record<string, string>));

  return fieldsData;
};

const utCheckIsARequiredField = (isVendor: boolean, field: Record<string, string>, isReqValid: boolean) => {
  let isRequiredFieldsValid = isReqValid;
  const allRequiredFieldsKeys = isVendor ? dtAllRequiredFieldsKeysForVendor : dtAllRequiredFieldsKeysForSupplier;
  const fieldKeys = Object.keys(field);
  if (!allRequiredFieldsKeys.every((key) => fieldKeys.includes(key))) { isRequiredFieldsValid = false; }

  allRequiredFieldsKeys.forEach((key) => {
    if (!field[key]) { isRequiredFieldsValid = false; }
  });

  return isRequiredFieldsValid;
};

const utCheckIsFieldInputTypeValid = (
  fieldDescriptor: MdCampaignFieldDescriptor | undefined, value: string, isValid: boolean,
) => {
  let isValidType = isValid;
  if (fieldDescriptor?.cfdAcceptableRespType === "decimal") {
    if (!Number(value.toString().replace(/,/g, "").replace(/\./g, ""))) { isValidType = false; }
  }

  if (fieldDescriptor?.cfdAcceptableRespType === "boolean") {
    if (value !== "Evet" && value !== "Hayır") { isValidType = false; }
  }
  return isValidType;
};

export const utCheckAllFieldsAreValid = (fields: Record<string, string>[], numFormat: string,
  isVendor: boolean = true): {
    isValid: boolean, isRequiredFieldsValid: boolean, isNumFormatValid: boolean, invalidFormattedNumbers: string[]
  } => {
  let isValid = true;
  let isRequiredFieldsValid = true;
  let isNumFormatValid = true;
  const invalidFormattedNumbers: string[] = [];
  fields.forEach((field) => {
    isRequiredFieldsValid = utCheckIsARequiredField(isVendor, field, isRequiredFieldsValid);

    Object.keys(field).forEach((key) => {
      const value = field[key];
      if (value !== undefined && value !== "") {
        const fieldDescriptor = dtCampaignFieldDescriptor.find((singleField) => singleField.cfdId === key);

        isValid = utCheckIsFieldInputTypeValid(fieldDescriptor, value, isValid);

        if (fieldDescriptor?.cfdAcceptableRespType === "decimal") {
          if (!utIsValidFormattedDecimal(value, numFormat)) {
            isNumFormatValid = false; invalidFormattedNumbers.push(value);
          }
        }
      }
    });
  });

  return {
    isValid, isRequiredFieldsValid, isNumFormatValid, invalidFormattedNumbers,
  };
};

export const utCampaignResponseErrors = (isCampaignExpired: boolean): void => {
  if (isCampaignExpired) throw new MdUnprocessableEntityError(ERR_CAMPAIGN_EXPIRED);
  throw new MdUnprocessableEntityError(ERR_CAMPAIGN_INVALID_FIELDS);
};

export const utThrowCampaignStatusUpdateError = (entityType: EntityTypes): void => {
  if (entityType === "business-partner") {
    throw new MdUnprocessableEntityError(ERR_SUPP_CAMP_STATUS_CANNOT_BE_CHANGED);
  } else throw new MdUnprocessableEntityError(ERR_VENDOR_CAMP_STATUS_CANNOT_BE_CHANGED);
};

export const utGetSlugByStates = (state: tpCampaignStatuses): string => {
  if (state === "New") return "notif__received__campaign_new";
  if (state === "Submit for Approval") return "notif__received__campaign_submit_for_approval";
  if (state === "Withdraw From Approval") return "notif__received__campaign_withdraw_from_approval";
  if (state === "Cancel") return "notif__received__campaign_cancel";
  if (state === "Viewed") return "notif__received__campaign_viewed";
  if (state === "Confirm") return "notif__received__campaign_confirm";
  if (state === "Reject") return "notif__received__campaign_reject";
  if (state === "Request Revision") return "notif__received__campaign_request_revision";
  return "";
};
