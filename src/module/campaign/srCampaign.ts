import { QueryBuilder, Transaction } from "knex";
import DoGroupDetails from "../entities/group/doGroupDetails";
import MdUnprocessableEntityError from "../../base/errors/mdUnprocessableEntityError";
import {
  utCanUpdateCampaignStatus, utCreateCampaign,
  utCreateCampaignFieldRelation, utTempCreateCampaignInstanceFieldRecRelation,
  utCreateCampaignSupplierRelation,
  utUpsertCampaignByExternalSource,
  utCreateCampaignInstanceFieldRecRelationBySlug,
  utThrowCampaignStatusUpdateError,
  utGetSlugByStates,
} from "./utCampaign";
import { dtDummyCampaignRecords } from "../shared/data/dtCampaignFieldRecords";
import doCampaign from "./doCampaign";
import doCampaignSupplier from "./campaignSupplier/doCampaignSupplier";
import {
  dtCampaignStatuses, tpCampaignApiData, tpCampaignStatuses,
  tpGetAllCampaigns, tpGetAllCampFields, tpGetCampaignRecords,
} from "./tpCampaign";
import knex from "../../base/database/cfgKnex";
import { srBuildFilterCriteria } from "../shared/services/filters/srFilter";
import { GridFilterStateType } from "../shared/types/tpFilter";
import { utCountTotalByQb } from "../shared/utils/utData";
import {
  ERR_CAMPAIGN_STATUS_IS_INVALID,
  ERR_CAMPAIGN_SUPPLIER_NOT_EXISTS,
} from "../shared/constants/dtOtherConstants";
import MdCampaignFieldResp from "./campaignFieldResp/mdCampaignFieldResp";
import MdCampaignRecord from "./campaignRecord/mdCampaignRecord";
import MdCampaignFieldDescriptor from "./campaignFieldDescriptor/mdCampaignFieldDescriptor";
import MdCampaignUserToken from "./campaignUserToken/mdCampaignUserToken";
import { UserSessionType } from "../shared/types/tpShared";
import doAppNotifications from "../appNotifications/doAppNotifications";
import MdEntityUser from "../entity/entityUser/mdEntityUser";
import MdCampaign from "./mdCampaign";
import { srSendNotificationHook } from "../appNotifications/srAppNotifications";
import {
  utGetCampDetailsEmailAttachment, utIsEmailServiceReady,
} from "./campaignEmail/utCampaignEmails";
import doEntityUser from "../entity/entityUser/doEntityUser";
import SrPrivileges from "../privilege/srPrivileges";
import { utHasCampaignPriv } from "../shared/utils/utAuth";
import doCampaignField from "./campaignField/doCampaignField";
import { utGetAllCampaignFieldsSlug, utTransformCampaignFieldIntoRecords } from "./campaignField/utCampaignFields";
import { srSendCampaignStatusEmails } from "./campaignEmail/srCampaignEmail";

const srGetFilteredQb = async (qb: QueryBuilder, filters: GridFilterStateType) => {
  const wrappedQbInSubQueryForFilters = knex.select("*").from(qb.as("SUBQ"));
  const qbWithFilters = srBuildFilterCriteria(wrappedQbInSubQueryForFilters, filters,
    undefined, false);

  const data = await qbWithFilters;
  const total = data.length ? await utCountTotalByQb(qbWithFilters) : 0;
  return { list: data, total };
};

const srSendCampaignStatusNotifications = async (
  trx: Transaction,
  { sender, receivers }: { sender: UserSessionType, receivers: MdEntityUser[] },
  campaign: MdCampaign,
  status: tpCampaignStatuses,
): Promise<void> => {
  await Promise.all(receivers.map(async (user) => doAppNotifications
    .insertOne(trx, {
      anSenderId: sender.uEntityId,
      anReceiverId: user.euUserEntityId,
      anTitle: status === "New"
        ? `notif__received__new_campaign_added || ["${campaign.cDescription}","${sender.userInstances[0].gName}"]`
        : `notif__received__campaign_change_status || ["${campaign.cDescription}" , ":Slug:${utGetSlugByStates(status)}"]`,
      anDescription: status === "New"
        ? `notif__received__new_campaign_added || ["${campaign.cDescription}","${sender.userInstances[0].gName}"]`
        : `notif__received__campaign_change_status || ["${campaign.cDescription}" , ":Slug:${utGetSlugByStates(status)}"]`,
      anMarkAsView: false,
      anSeverity: "normal",
    })));
  await Promise.all(receivers.map((receiver) => srSendNotificationHook(receiver.euUserEntityId)));
};

const srGetUsersWithCampaignPrivs = async (trx: Transaction, gEntityId: string): Promise<MdEntityUser[]> => {
  const allGroupUsers = await doEntityUser.findAllByPredicate(trx, { euEntityId: gEntityId });
  const privilegedUsers: MdEntityUser[] = [];
  const checkAllUsersPrivs = allGroupUsers.map(async (user) => {
    const getUserPrivs = await SrPrivileges.getUserAllPrivileges(trx, user.euUserEntityId);
    if (utHasCampaignPriv(getUserPrivs.permissions)) {
      privilegedUsers.push(user);
    }
  });
  await Promise.all(checkAllUsersPrivs);
  return privilegedUsers;
};

class SrCampaign {
  static getAllCampaignsByQb(
    trx: Transaction, qb: QueryBuilder, selectedInstance: string,
  ): QueryBuilder<tpGetAllCampaigns[]> {
    return doCampaign.getAllCampaignsByQb(trx, qb, selectedInstance);
  }

  static getAllCampaigns(trx: Transaction, selectedUserInstance: string): QueryBuilder<tpGetAllCampaigns[]> {
    return doCampaign.getAllCampaigns(trx, selectedUserInstance);
  }

  static getCampaignsByDateRange(trx: Transaction, selectedUserInstance: string,
    startDate: string, endDate: string): QueryBuilder<tpGetAllCampaigns[]> {
    return doCampaign.getAllCampaignsByDateRange(trx, selectedUserInstance, startDate, endDate);
  }

  static getAllCampaignsForSupplierByQb(
    trx: Transaction, qb: QueryBuilder, selectedUserInstance: string,
  ): QueryBuilder<tpGetAllCampaigns[]> {
    return doCampaign.getAllCampaignsForSupplierByQb(trx, qb, selectedUserInstance);
  }

  static async getCampaignDetails(
    trx: Transaction, campaignSupplierId: string, filters: GridFilterStateType,
  ): Promise<{ columns: tpGetAllCampFields, list: tpGetCampaignRecords[], total: number, campaignSupplierId: string }> {
    const campSupplier = await doCampaignSupplier.findOneByCol(trx, "csId", campaignSupplierId);
    const campaign = await doCampaign.findOneByCol(trx, "cId", campSupplier.csCampId);
    if (campSupplier) {
      const campaignFieldsWithRecQb = doCampaign.getRecordsForCampaign(trx, campSupplier.csCampId);
      const campSupp = await doCampaignSupplier.findOneByCol(trx, "csId", campaignSupplierId);
      campaignFieldsWithRecQb.leftJoin(MdCampaignFieldResp.TABLE_NAME, {
        [MdCampaignFieldResp.col("cfrCampRecordId")]: MdCampaignRecord.col("crId"),
        [MdCampaignFieldResp.col("cfrFieldDescriptorId")]: MdCampaignFieldDescriptor.col("cfdId"),
        [MdCampaignFieldResp.col("cfrCampSupplierId")]: trx.raw("?", campSupp.csSupplierId),
        [MdCampaignFieldResp.col("cfrCampInstanceId")]: trx.raw("?", campaign.cInstanceId),
      });
      const campaignFieldsSludges = await utGetAllCampaignFieldsSlug(trx, campSupplier.csCampId);
      const campFieldRecsQb = utTransformCampaignFieldIntoRecords(trx, campaignFieldsWithRecQb, campaignFieldsSludges);
      return {
        columns: (await doCampaignField.getCampaignAllFields(trx, campSupplier.csCampId)),
        ...(await srGetFilteredQb(campFieldRecsQb, filters)),
        campaignSupplierId,
      };
    }
    throw new MdUnprocessableEntityError(ERR_CAMPAIGN_SUPPLIER_NOT_EXISTS);
  }

  static async updateCampaignsStatus(
    trx: Transaction, data: { campSuppliersIds: string[], status: tpCampaignStatuses }, user: UserSessionType,
  ): Promise<void> {
    const isValidCampStatuses = dtCampaignStatuses.includes(data.status);
    const userSelectedInstance = user.userInstances[0];
    if (isValidCampStatuses) {
      if (await utCanUpdateCampaignStatus(trx, data.status, data.campSuppliersIds)) {
        const updateCampStatusPromises = data.campSuppliersIds.map((csId) => doCampaignSupplier
          .updateOneByColName(trx, { csStatus: data.status }, "csId", csId));
        await Promise.all(updateCampStatusPromises);
        const sendNotificationStatusPromises = data.campSuppliersIds.map(async (csId) => {
          const campaignSupplier = await doCampaignSupplier.findOneByCol(trx, "csId", csId);
          const campaign = await doCampaign.findOneByCol(trx, "cId", campaignSupplier.csCampId);
          const privilegedReceivers = userSelectedInstance.entityType === "business-partner"
            ? await srGetUsersWithCampaignPrivs(trx, campaign.cInstanceId)
            : await srGetUsersWithCampaignPrivs(trx, campaignSupplier.csSupplierId);
          await srSendCampaignStatusNotifications(trx, {
            sender: user, receivers: privilegedReceivers,
          }, campaign, data.status);
          if (utIsEmailServiceReady()) {
            const attachmentData = await utGetCampDetailsEmailAttachment(trx, csId, userSelectedInstance.entityType);
            await srSendCampaignStatusEmails(
              trx, { sender: user, receivers: privilegedReceivers }, { campaign, status: data.status }, attachmentData,
            );
          }
        });
        await Promise.all(sendNotificationStatusPromises);
      } else {
        utThrowCampaignStatusUpdateError(userSelectedInstance.entityType);
      }
    } else {
      throw new MdUnprocessableEntityError(ERR_CAMPAIGN_STATUS_IS_INVALID);
    }
  }

  static async tempCreateCampaign(trx: Transaction, vendorId: string, userSession: UserSessionType): Promise<void> {
    const group = await DoGroupDetails.findOneByCol(trx, "refSpId", vendorId);
    if (!group) throw new MdUnprocessableEntityError(`The instance ${vendorId} does not exists`);

    const campaign = await utCreateCampaign(trx, group, userSession.uEntityId);
    await utCreateCampaignFieldRelation(trx, campaign);
    await utCreateCampaignSupplierRelation(trx, campaign, group, userSession);
    await utTempCreateCampaignInstanceFieldRecRelation(trx, campaign, dtDummyCampaignRecords);
  }

  static async createCampaignByExternalSource(
    trx: Transaction, campaignData: tpCampaignApiData[], cutToken: MdCampaignUserToken, user: UserSessionType,
  ): Promise<void> {
    await Promise.all(campaignData.map(async (singleCampaign: tpCampaignApiData) => {
      const group = await DoGroupDetails.findOneByCol(trx, "refSpId", singleCampaign.campaignsInstanceId);
      if (!group) throw new MdUnprocessableEntityError(`The instance ${singleCampaign.campaignsInstanceId} does not exists`);
      const campaign = await utUpsertCampaignByExternalSource(trx, group, singleCampaign, cutToken);
      await utCreateCampaignFieldRelation(trx, campaign);
      await utCreateCampaignSupplierRelation(trx, campaign, group, user);
      await utCreateCampaignInstanceFieldRecRelationBySlug(trx, campaign, singleCampaign.campaignsRecord);
    }));
  }
}

export default SrCampaign;
