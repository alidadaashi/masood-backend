import { NextFunction, Request, Response } from "express";
import moment from "moment";
import { Transaction } from "knex";
import MdUnprocessableEntityError from "../../base/errors/mdUnprocessableEntityError";
import {
  DEFAULT_CAMPAIGN_API_TOKEN_EXPIRY_IN_HOURS,
  ERR_USER_NOT_EXISTS, MESSAGE_CAMPAIGN_CREATED, MESSAGE_INVALID_DATA, MESSAGE_PERMISSION_DENIED,
} from "../shared/constants/dtOtherConstants";
import knex from "../../base/database/cfgKnex";
import doCredential from "../user/credentials/doCredential";
import doUser from "../user/doUser";
import doCampaignUserToken from "../campaign/campaignUserToken/doCampaignUserToken";
import { srGetCampaignsByDateRange, srGetCredentialsFromReq, srMergeCampaignWithDetails } from "./srExternalApi";
import { srCheckCredentials, srCheckIsTokenExpire } from "../auth/srAuth";
import SrCampaign from "../campaign/srCampaign";
import SrUserSelectedInstance from "../user/userSelectedInstance/srUserSelectedInstance";
import SrAclGuardHitAllApi from "../../routes/srAclGuardHitAllApi";
import { ctGetUserSessionData } from "../auth/ctAuth";
import MdUser from "../user/mdUser";
import { UserSessionType } from "../shared/types/tpShared";
import MdCampaignUserToken from "../campaign/campaignUserToken/mdCampaignUserToken";

const srCheckPriviligesAndInsertToken = async (
  trx: Transaction,
  { session, user }: { session: UserSessionType, user: MdUser },
  tokenExpiry: string,
  res: Response,
) => {
  const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
    .getSelectedInstance(trx, session.uEntityId) || {};
  if (SrAclGuardHitAllApi.srCanHitCampaignAllApi(session, usiSelectedInstanceEntityId as string)) {
    await doCampaignUserToken.deleteManyByColWhereIn(trx, "cutEntityId", [user.uEntityId]);
    const [campaignUserToken] = await doCampaignUserToken.insertOne(trx, {
      cutEntityId: user.uEntityId,
      cutExpiry: tokenExpiry,
    });
    res.status(200).send({ token: campaignUserToken.cutToken });
  } else {
    throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
  }
};

const srCheckPriviligesAndGetCampaigns = async (
  trx: Transaction,
  { session, campaignUserToken }: { session: UserSessionType, campaignUserToken: MdCampaignUserToken },
  { dateEnd, dateFrom }: { dateEnd: string, dateFrom: string },
  res: Response,
) => {
  const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
    .getSelectedInstance(trx, session.uEntityId) || {};
  if (SrAclGuardHitAllApi.srCanHitCampaignAllApi(session, usiSelectedInstanceEntityId as string)) {
    if (srCheckIsTokenExpire(campaignUserToken.cutExpiry)) {
      const allCampaigns = await srGetCampaignsByDateRange(dateEnd as string, dateFrom as string,
        trx, usiSelectedInstanceEntityId as string);
      const mergeCampaignWithDetails = await srMergeCampaignWithDetails(allCampaigns, trx);
      const transformResData = mergeCampaignWithDetails.map((campaign) => ({
        campaignId: campaign.csId,
        creator: campaign.cCreator,
        campaignTextNo: campaign.cTextNo,
        campaignCode: campaign.cCode,
        campaignErpCode: campaign.cErpCode,
        campaignReferenceText: campaign.cReferenceText,
        campaignText: campaign.cText,
        campaignDescription: campaign.cDescription,
        campaignStartDate: campaign.cStartDate,
        campaignEndDate: campaign.cEndDate,
        campaignReleaseDate: campaign.cReleaseDate,
        campaignDeadline: campaign.cDeadline,
        campaignCreatedAt: campaign.cCreatedAt,
        campaignStatus: campaign.csStatus,
        campaignDetails: campaign.campaignDetail,
      }));

      res.status(200).sendList({ list: transformResData });
    } else {
      throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
    }
  } else {
    throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
  }
};

class CtExternalApi {
  static async auth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = srGetCredentialsFromReq(req);
      const { expiryInHours } = req.body;
      if (email && password) {
        await knex.transaction(async (trx) => {
          const credentials = await doCredential.findOneByCol(trx, "cEmail", email);
          if (await srCheckCredentials(credentials, password, trx)) {
            const user = await doUser.findOneByCol(trx, "uEntityId", credentials.cUserEntityId);
            const session = await ctGetUserSessionData(trx, req.session.id, user);
            const setExpiryDate = moment().add(expiryInHours
              || DEFAULT_CAMPAIGN_API_TOKEN_EXPIRY_IN_HOURS, "hour").format();
            await srCheckPriviligesAndInsertToken(trx, { session, user }, setExpiryDate, res);
          } else {
            res.status(401).send({ message: ERR_USER_NOT_EXISTS });
          }
        });
      } else {
        throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
      }
    } catch (e) {
      next(e);
    }
  }

  static async addCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req?.headers?.authorization) {
        const { authorization } = req.headers;
        const token = authorization.replace("Bearer ", "");
        if (token) {
          await knex.transaction(async (trx) => {
            const campaignUserToken = await doCampaignUserToken.findOneByCol(trx, "cutToken", token);
            const user = await doUser.findOneByCol(trx, "uEntityId", campaignUserToken.cutEntityId);
            const session = await ctGetUserSessionData(trx, req.session.id, user);
            const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
              .getSelectedInstance(trx, session.uEntityId) || {};
            if (SrAclGuardHitAllApi.srCanHitCampaignAllApi(session, usiSelectedInstanceEntityId as string)) {
              if (srCheckIsTokenExpire(campaignUserToken.cutExpiry)) {
                await SrCampaign.createCampaignByExternalSource(trx, req.body, campaignUserToken, session);
                res.status(200).send({ message: MESSAGE_CAMPAIGN_CREATED });
              } else {
                throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
              }
            } else {
              throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
            }
          });
        } else {
          throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
        }
      }
    } catch (e) {
      next(e);
    }
  }

  static async getCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req?.headers?.authorization) {
        const { authorization } = req.headers;
        const token = authorization.replace("Bearer ", "");
        if (token) {
          await knex.transaction(async (trx) => {
            const campaignUserToken = await doCampaignUserToken.findOneByCol(trx, "cutToken", token);
            const user = await doUser.findOneByCol(trx, "uEntityId", campaignUserToken.cutEntityId);
            const session = await ctGetUserSessionData(trx, req.session.id, user);
            const { dateEnd, dateFrom } = req.query as { dateEnd: string, dateFrom: string };
            await srCheckPriviligesAndGetCampaigns(trx, { session, campaignUserToken }, { dateEnd, dateFrom }, res);
          });
        } else {
          throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
        }
      }
    } catch (e) {
      next(e);
    }
  }
}

export default CtExternalApi;
