import { Transaction } from "knex";
import moment from "moment";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import {
  utGetTransformedFieldData,
  utCheckAllFieldsAreValid,
  utCampaignResponseErrors,
} from "../utCampaign";
import doCampaign from "../doCampaign";
import doCampaignSupplier from "../campaignSupplier/doCampaignSupplier";
import {
  ERR_VENDOR_CAMP_DETAILS_CANNOT_BE_UPDATED,
  ERR_SUPP_CAMP_DETAILS_CANNOT_BE_UPDATED,
} from "../../shared/constants/dtOtherConstants";
import {
  utCampaignFieldsErrors, utCampaignFieldsErrorsVendor, utCanSaveCampaignByProductsStatus,
  utSaveCampaignFieldResponse, utSaveCampaignRecordToDb,
} from "./utCampaignFieldResp";
import MdCampaignSupplier from "../campaignSupplier/mdCampaignSupplier";
import SrUserPreferences from "../../preferences/userPreference/srUserPreferences";
import { tpCampaignResponseData, tpCampaignStatuses } from "../tpCampaign";

const srCanUpdateItemResponse = (campaignSupplier: MdCampaignSupplier, isSupplier: boolean): boolean => {
  const statusesToPreventResponseUpdateSuppSide: tpCampaignStatuses[] = ["Cancel", "Submit for Approval", "Confirm"];
  const statusesToPreventResponseUpdateVendorSide: tpCampaignStatuses[] = ["Cancel", "Confirm", "Request Revision"];
  if (isSupplier) {
    return !statusesToPreventResponseUpdateSuppSide.includes(campaignSupplier.csStatus);
  }
  return !statusesToPreventResponseUpdateVendorSide.includes(campaignSupplier.csStatus);
};

const srGetCampaignSupplierAndVerifyStatus = async (trx: Transaction, campaignSupplierId: string, isSupplier: boolean) => {
  const campaignSupplier = await doCampaignSupplier.findOneByCol(trx, "csId", campaignSupplierId);
  const campaign = await doCampaign.findOneByCol(trx, "cId", campaignSupplier.csCampId);
  const errMsg = isSupplier ? ERR_SUPP_CAMP_DETAILS_CANNOT_BE_UPDATED : ERR_VENDOR_CAMP_DETAILS_CANNOT_BE_UPDATED;
  if (!srCanUpdateItemResponse(campaignSupplier, isSupplier)) {
    throw new MdUnprocessableEntityError(errMsg);
  }
  return { campaignSupplier, campaign };
};

class SrCampaignFieldResp {
  static async saveCampaignItemsResponseForSupplier(
    trx: Transaction, campaignSupplierId: string,
    { userEntityId, selectedSupplierId }: { userEntityId: string, selectedSupplierId: string },
    data: Record<string, string>[],
  ): Promise<void> {
    const { campaignSupplier, campaign } = await srGetCampaignSupplierAndVerifyStatus(trx, campaignSupplierId, true);
    const isCampaignExpired = moment().isAfter(moment(campaign.cEndDate));
    if (!isCampaignExpired) {
      const userPrefNumFormat = (
        await SrUserPreferences.getUserPreferenceByType(trx, userEntityId, "numFmt")
      ).upValue as string;
      let fieldsData = await utGetTransformedFieldData(trx, campaignSupplier.csCampId, data, "supplier");
      const productIdsToRemove = await utCanSaveCampaignByProductsStatus(trx, fieldsData, campaignSupplier.csSupplierId);
      fieldsData = fieldsData.filter((value, index) => index !== productIdsToRemove.findIndex((t) => (t === value.crId)));
      utCampaignFieldsErrors(fieldsData, userPrefNumFormat);
      await utSaveCampaignRecordToDb(
        { supplierId: selectedSupplierId, prefNumFormat: userPrefNumFormat }, campaign, trx, fieldsData,
      );
    } else {
      utCampaignResponseErrors(isCampaignExpired);
    }
  }

  static async saveCampaignItemsResponse(
    trx: Transaction, campaignSupplierId: string,
    { userEntityId, selectedInstanceId }: { userEntityId: string, selectedInstanceId: string },
    data: Record<string, string>[],
  ): Promise<void> {
    const { campaignSupplier, campaign } = await srGetCampaignSupplierAndVerifyStatus(trx, campaignSupplierId, false);
    const isCampaignExpired = moment().isAfter(moment(campaign.cEndDate));
    if (!isCampaignExpired) {
      const campaignResponseData: tpCampaignResponseData = {
        supplierId: campaignSupplier.csSupplierId,
        instanceId: selectedInstanceId,
        responseBy: "instance",
      };
      const userPrefNumFormat = (
        await SrUserPreferences.getUserPreferenceByType(trx, userEntityId, "numFmt")
      ).upValue as string;
      const fieldsData = await utGetTransformedFieldData(trx, campaignSupplier.csCampId, data, "instance");
      const {
        isValid, isRequiredFieldsValid, isNumFormatValid, invalidFormattedNumbers,
      } = utCheckAllFieldsAreValid(fieldsData, userPrefNumFormat, true);
      utCampaignFieldsErrorsVendor(isValid, isRequiredFieldsValid, isNumFormatValid, {
        invalidFormattedNumbers, userPrefNumFormat,
      });
      await utSaveCampaignFieldResponse(trx, campaignResponseData, fieldsData, userPrefNumFormat);
    } else {
      utCampaignResponseErrors(isCampaignExpired);
    }
  }
}

export default SrCampaignFieldResp;
