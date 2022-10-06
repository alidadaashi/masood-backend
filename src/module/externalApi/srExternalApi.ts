import { Request } from "express";
import { Transaction } from "knex";
import MdUnprocessableEntityError from "../../base/errors/mdUnprocessableEntityError";
import SrCampaign from "../campaign/srCampaign";
import { tpCampaignDetailsResponse, tpGetAllCampaigns } from "../campaign/tpCampaign";
import { MESSAGE_INVALID_DATA } from "../shared/constants/dtOtherConstants";

export const srGetCredentialsFromReq = (req: Request): { email: string, password: string } => {
  if (req.headers.authorization) {
    const encoded = req.headers.authorization.split(" ")[1];
    const decoded = Buffer.from(encoded, "base64").toString();
    const email = decoded.split(":")[0];
    const password = decoded.split(":")[1];
    return { email, password };
  }
  throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
};

export const srMergeCampaignWithDetails = async (allCampaigns: tpGetAllCampaigns[],
  trx: Transaction): Promise<tpCampaignDetailsResponse[]> => {
  const campaignDetailsData = await Promise.all(
    allCampaigns.map((campaign) => SrCampaign.getCampaignDetails(trx, campaign.csId as string, {
      skip: 0,
      take: 1000,
      sort: [],
    })),
  );

  const mergeData: tpCampaignDetailsResponse[] = allCampaigns.map(
    (campaign: tpGetAllCampaigns) => {
      const campaignDetails = campaignDetailsData.find(
        (data) => data.campaignSupplierId === campaign.csId,
      );
      return {
        ...campaign,
        campaignDetail: campaignDetails?.list,
      };
    },
  );
  return mergeData;
};

export const srGetCampaignsByDateRange = async (dateEnd: string, dateFrom: string,
  trx: Transaction, selectedInstanceEntityId: string): Promise<tpGetAllCampaigns[]> => {
  let allCampaigns;
  if (dateEnd && dateFrom) {
    allCampaigns = await SrCampaign.getCampaignsByDateRange(trx,
      selectedInstanceEntityId, dateFrom.toString(), dateEnd.toString());
  } else {
    allCampaigns = await SrCampaign.getAllCampaigns(trx, selectedInstanceEntityId);
  }
  return allCampaigns;
};
