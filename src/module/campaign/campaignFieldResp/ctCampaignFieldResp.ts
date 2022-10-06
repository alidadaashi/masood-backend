import { NextFunction, Request, Response } from "express";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { MESSAGE_PERMISSION_DENIED, MESSAGE_CAMPAIGN_RESPONSE_SAVED } from "../../shared/constants/dtOtherConstants";
import SrUserSelectedInstance from "../../user/userSelectedInstance/srUserSelectedInstance";
import SrAclGuardCampaign from "../../../routes/srAclGuardCampaign";
import knex from "../../../base/database/cfgKnex";
import { utGetUserSession } from "../../shared/utils/utOther";
import doCampaignSupplier from "../campaignSupplier/doCampaignSupplier";
import SrCampaignFieldResp from "./srCampaignFieldResp";

class CtCampaignFieldResp {
  static async saveCampaignItemsResponseForSupplier(
    req: Request<{ campaignSupplierId: string }>, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const data = req.body;
      const { campaignSupplierId } = req.params;
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, session.uEntityId) || {};
        if (await SrAclGuardCampaign.canUpdateSupplierCampaignDetails(trx, session, usiSelectedInstanceEntityId as string)) {
          await SrCampaignFieldResp.saveCampaignItemsResponseForSupplier(trx, campaignSupplierId,
            { userEntityId: session.uEntityId, selectedSupplierId: usiSelectedInstanceEntityId as string }, data);
          res.sendMsg(MESSAGE_CAMPAIGN_RESPONSE_SAVED);
        } else {
          throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async saveCampaignItemsResponse(
    req: Request<{ campaignSupplierId: string }>, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const data = req.body;
      const { campaignSupplierId } = req.params;
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, session.uEntityId) || {};
        const campaignSupplier = await doCampaignSupplier.findOneByCol(trx, "csId", campaignSupplierId);
        if (await SrAclGuardCampaign.canUpdateCampaignDetails(trx, {
          userEntityId: session.uEntityId,
          updatingCampId: campaignSupplier.csCampId,
          privs: session,
          updatingCampInstanceId: usiSelectedInstanceEntityId as string,
        })) {
          await SrCampaignFieldResp.saveCampaignItemsResponse(trx, campaignSupplierId,
            { userEntityId: session.uEntityId, selectedInstanceId: usiSelectedInstanceEntityId as string }, data);
          res.sendMsg(MESSAGE_CAMPAIGN_RESPONSE_SAVED);
        } else {
          throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
        }
      });
    } catch (e) {
      next(e);
    }
  }
}
export default CtCampaignFieldResp;
