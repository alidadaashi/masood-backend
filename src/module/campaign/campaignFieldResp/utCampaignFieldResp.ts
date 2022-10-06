import { Transaction } from "knex";
import MdCampaignFieldResp from "./mdCampaignFieldResp";
import DoCampaignFieldResp from "./doCampaignFieldResp";
import { tpCampaignResponseData } from "../tpCampaign";
import {
  CAMPAIGN_DETAIL_PROD_STATUS_APPROVED, CAMPAIGN_DETAIL_PROD_STATUS_REJECT,
  CAMP_DETAIL_CATEGORY_COMMENT_FIELD_DESC_ID, dtCampaignEditableDecimalNumericFieldsIds,
} from "../../shared/data/dtCampaignFieldRecords";
import MdCampaign from "../mdCampaign";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import {
  ERR_PRODUCT_STATUS_IS_APPROVED_OR_REJECTED, ERR_CAMPAIGN_INVALID_FIELDS, ERR_CAMPAIGN_REQUIRED_FIELDS,
} from "../../shared/constants/dtOtherConstants";
import { utFormatNumericValueForDb } from "../../shared/utils/utString";
import { utCheckAllFieldsAreValid } from "../utCampaign";

type tpProductFieldResp = {
  isStatusApprovOrReject: boolean;
  crId: string;
}

const utGetFormattedFieldValue = (fieldId: string, value: string, prefNumFormat: string) => {
  let formattedValue = value;
  if (dtCampaignEditableDecimalNumericFieldsIds.includes(fieldId)) {
    formattedValue = utFormatNumericValueForDb(value, prefNumFormat);
  }
  return formattedValue;
};

export const utSaveCampaignFieldResponse = async (
  trx: Transaction,
  campaignResponseData: tpCampaignResponseData,
  data: Record<string, string>[],
  prefNumFormat: string,
): Promise<MdCampaignFieldResp[]> => {
  const { instanceId, responseBy, supplierId } = campaignResponseData;
  const fieldsDataForDb = data.map((di): MdCampaignFieldResp[] => Object
    .entries(di)
    .map(([fieldId, fieldValue]): MdCampaignFieldResp => ({
      cfrResponseBy: responseBy,
      cfrCampSupplierId: supplierId,
      cfrCampInstanceId: instanceId,
      cfrCampRecordId: di.crId,
      cfrValue: utGetFormattedFieldValue(fieldId, fieldValue, prefNumFormat) || "",
      cfrFieldDescriptorId: fieldId,
    })))
    .flat()
    .filter((di) => di.cfrFieldDescriptorId !== "crId");

  return DoCampaignFieldResp.upsertMany(trx, fieldsDataForDb,
    ["cfrCampRecordId", "cfrCampSupplierId", "cfrCampInstanceId", "cfrFieldDescriptorId", "cfrResponseBy"]);
};

export const utCanSaveCampaignByProductsStatus = async (trx: Transaction,
  fields: Record<string, string>[],
  campSupplierId: string): Promise<string[]> => {
  const isStatusApprovOrRejectArray: tpProductFieldResp[] = [];
  for (let index = 0; index < fields.length; index += 1) {
    for (const key in fields[index]) {
      if (key === "crId") {
        const isFieldExists = await DoCampaignFieldResp.findOneByPredicate(trx, {
          cfrCampSupplierId: campSupplierId,
          cfrFieldDescriptorId: CAMP_DETAIL_CATEGORY_COMMENT_FIELD_DESC_ID,
          cfrCampRecordId: fields[index][key],
        });
        const isStatusApprovOrReject = isFieldExists
          ? (isFieldExists.cfrValue === CAMPAIGN_DETAIL_PROD_STATUS_APPROVED
            || isFieldExists.cfrValue === CAMPAIGN_DETAIL_PROD_STATUS_REJECT) : false;
        isStatusApprovOrRejectArray.push({ isStatusApprovOrReject, crId: fields[index][key] });
      }
    }
  }
  const productIdsToRemove = isStatusApprovOrRejectArray.filter((di) => di.isStatusApprovOrReject).map((di) => di.crId);
  return productIdsToRemove;
};

export const utSaveCampaignRecordToDb = async (
  { supplierId, prefNumFormat }: { supplierId: string, prefNumFormat: string },
  campaign: MdCampaign,
  trx: Transaction, fieldsData: Record<string, string>[],
): Promise<void> => {
  const campaignResponseData: tpCampaignResponseData = {
    supplierId,
    instanceId: campaign.cInstanceId,
    responseBy: "supplier",
  };
  await utSaveCampaignFieldResponse(trx, campaignResponseData, fieldsData, prefNumFormat);
};

const utGetSlugByPrefFormat = (invalidNumbers: string[], numFmt:string) => {
  let slug;
  if (numFmt === ",sep.decimal") slug = "notif__number_format_comma_sep_pref_example";
  else slug = "notif__number_format_decimal_sep_pref_example";

  return `notif__err__campaign_invalid_number_format || ["${invalidNumbers.slice(0, 3).join("  ")}..", ":Slug:${slug}"]`;
};

export const utCampaignFieldsErrors = (fieldsData: Record<string, string>[], userPrefNumFormat: string): void => {
  const {
    isValid, isRequiredFieldsValid, isNumFormatValid, invalidFormattedNumbers,
  } = utCheckAllFieldsAreValid(fieldsData, userPrefNumFormat, false);
  if (!fieldsData.length) {
    throw new MdUnprocessableEntityError(ERR_PRODUCT_STATUS_IS_APPROVED_OR_REJECTED);
  } else if (!isValid) {
    throw new MdUnprocessableEntityError(ERR_CAMPAIGN_INVALID_FIELDS);
  } else if (!isRequiredFieldsValid) {
    throw new MdUnprocessableEntityError(ERR_CAMPAIGN_REQUIRED_FIELDS);
  } else if (!isNumFormatValid && invalidFormattedNumbers.length > 0) {
    throw new MdUnprocessableEntityError(
      utGetSlugByPrefFormat(invalidFormattedNumbers, userPrefNumFormat),
    );
  }
};

export const utCampaignFieldsErrorsVendor = (
  isAllFieldsValid: boolean, isAllRequiredFieldsValid: boolean,
  isNumFormatValid: boolean,
  { invalidFormattedNumbers, userPrefNumFormat }: { invalidFormattedNumbers: string[], userPrefNumFormat: string },
): void => {
  if (!isAllRequiredFieldsValid) throw new MdUnprocessableEntityError(ERR_CAMPAIGN_REQUIRED_FIELDS);
  else if (!isAllFieldsValid) throw new MdUnprocessableEntityError(ERR_CAMPAIGN_INVALID_FIELDS);
  else if (!isNumFormatValid && invalidFormattedNumbers.length > 0) {
    const errMsg = utGetSlugByPrefFormat(invalidFormattedNumbers, userPrefNumFormat);
    throw new MdUnprocessableEntityError(errMsg);
  }
};
