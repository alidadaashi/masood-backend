import { QueryBuilder, Transaction } from "knex";
import {
  PERMISSIONS, P_OPTION_ALL_IN_GROUP, P_OPTION_OWN_IN_GROUP,
} from "../module/shared/constants/dtPermissionConstants";
import { PermissionOptionTypes, PrivilegeTypeV1 } from "../module/shared/types/tpShared";
import {
  utGetAllIdsFromPermissionOfTypeForCampaign,
  utGetAllPermissionValues, utGetPermissionKeyWhereTypeIs,
} from "./utAclHelper";
import MdCreatorEntity from "../module/entities/creatorEntity/mdCreatorEntity";
import doCampaign from "../module/campaign/doCampaign";
import MdCampaign from "../module/campaign/mdCampaign";
import MdCampaignSupplier from "../module/campaign/campaignSupplier/mdCampaignSupplier";

const srGetDataForQueryByPrivileges = (
  privileges: PrivilegeTypeV1["privileges"], permissions: string[], optionType: string,
): { allGroupIds: string[] } | null => {
  const permissionKey = utGetPermissionKeyWhereTypeIs(privileges.campaign.permissions, optionType);
  const allInGroupIds = utGetAllIdsFromPermissionOfTypeForCampaign(privileges.campaign, permissionKey, optionType);
  if (allInGroupIds.length) {
    return { allGroupIds: allInGroupIds };
  }
  return null;
};

const srGetViewAllInGroupQb = (
  trx: Transaction, permissions: string[], privileges: PrivilegeTypeV1["privileges"],
) => {
  const data = srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_ALL_IN_GROUP);
  if (data) {
    return doCampaign.getDefaultQb(trx)
      .whereIn(MdCampaign.col("cInstanceId"), data.allGroupIds);
  }
  return null;
};

const srGetViewAllInGroupSupplierQb = (
  trx: Transaction, permissions: string[], privileges: PrivilegeTypeV1["privileges"],
) => {
  const data = srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_ALL_IN_GROUP);
  if (data) {
    return doCampaign.getDefaultQb(trx)
      .whereIn(MdCampaignSupplier.col("csSupplierId"), data.allGroupIds);
  }
  return null;
};

const srGetCampSummaryAllInGroup = (
  trx: Transaction, permissions: string[], privileges: PrivilegeTypeV1["privileges"], selectedInstance: string,
) => {
  const data = srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_ALL_IN_GROUP);
  if (data && data.allGroupIds.includes(selectedInstance)) {
    return doCampaign.getCampaignsSummary(trx, selectedInstance);
  }
  return null;
};

const srGetCampSummaryOwnInGroup = (
  trx: Transaction, params: {
    permissions: string[], privileges: PrivilegeTypeV1["privileges"], userEntityId: string, selectedInstance: string
  },
) => {
  const {
    permissions, privileges, userEntityId, selectedInstance,
  } = params;
  const data = !permissions.includes(P_OPTION_OWN_IN_GROUP)
    && privileges.campaign.permissions?.c === P_OPTION_ALL_IN_GROUP
    ? srGetDataForQueryByPrivileges(privileges, [...permissions, P_OPTION_ALL_IN_GROUP],
      P_OPTION_ALL_IN_GROUP)
    : srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_OWN_IN_GROUP);
  if (data) {
    return doCampaign.getCampaignsSummaryOwnInGroupQb(trx, selectedInstance, data.allGroupIds, userEntityId);
  }
  return null;
};

const srGetViewOwnInGroupQb = (
  trx: Transaction, permissions: string[], privileges: PrivilegeTypeV1["privileges"], userEntityId: string,
) => {
  const data = !permissions.includes(P_OPTION_OWN_IN_GROUP)
    && privileges.campaign.permissions?.c === P_OPTION_ALL_IN_GROUP
    ? srGetDataForQueryByPrivileges(privileges, [...permissions, P_OPTION_ALL_IN_GROUP],
      P_OPTION_ALL_IN_GROUP)
    : srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_OWN_IN_GROUP);
  if (data) {
    return doCampaign.getDefaultQb(trx)
      .where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
      .whereIn(MdCampaign.col("cInstanceId"), data.allGroupIds);
  }
  return null;
};

const srGetUpdateAllInGroup = (
  privileges: PrivilegeTypeV1["privileges"], permissions: string[], updatingCampInstanceId: string,
) => {
  const data = srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_ALL_IN_GROUP);
  if (data) {
    return !!data.allGroupIds.includes(updatingCampInstanceId);
  }
  return null;
};

const srGetUpdateAllInGroupForSupplier = async (
  trx: Transaction, privileges: PrivilegeTypeV1["privileges"], permissions: string[], selectedInstance: string,
) => {
  const data = srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_ALL_IN_GROUP);
  if (data) {
    return !!await doCampaign.getAllCampaignsForSupplier(trx, selectedInstance)
      .whereIn(MdCampaignSupplier.col("csSupplierId"), data.allGroupIds)
      .first();
  }
  return null;
};

const srGetUpdateOwnInGroup = async (
  trx: Transaction,
  params: {
    userEntityId: string,
    updatingCampInstanceId: string,
    updatingCampId: string,
    privileges: PrivilegeTypeV1["privileges"],
    permissions: string[]
  },
) => {
  const {
    privileges, permissions, userEntityId, updatingCampId,
  } = params;
  const campEntity = await doCampaign.findOneByCol(trx, "cId", updatingCampId);
  const data = !permissions.includes(P_OPTION_OWN_IN_GROUP)
    && privileges.campaign.permissions?.c === P_OPTION_ALL_IN_GROUP
    ? srGetDataForQueryByPrivileges(privileges, [...permissions, P_OPTION_ALL_IN_GROUP],
      P_OPTION_ALL_IN_GROUP)
    : srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_OWN_IN_GROUP);

  if (data && campEntity) {
    return !!await doCampaign.getDefaultQb(trx)
      .whereIn(MdCampaign.col("cInstanceId"), data.allGroupIds)
      .where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
      .andWhere(MdCreatorEntity.col("ceEntityId"), campEntity.cEntityId)
      .first();
  }

  return null;
};

class SrAclGuardCampaign {
  static srGetCampaignListViewQb(
    trx: Transaction, userEntityId: string, privs: PrivilegeTypeV1,
  ): QueryBuilder | null {
    let qb = null;
    if (privs.privileges) {
      const permissions = utGetAllPermissionValues({
        v: privs.privileges.campaign.permissions.v,
        e: privs.privileges.campaign.permissions.e,
        d: privs.privileges.campaign.permissions.d,
      } as Record<PermissionOptionTypes, string>);
      if (!privs.privileges.permissions.includes(PERMISSIONS.CAMPAIGN)) return null;
      if (permissions.includes(P_OPTION_ALL_IN_GROUP)) qb = srGetViewAllInGroupQb(trx, permissions, privs.privileges);
      else if (
        permissions.includes(P_OPTION_OWN_IN_GROUP)
        || privs.privileges.campaign.permissions?.c === P_OPTION_ALL_IN_GROUP
      ) qb = srGetViewOwnInGroupQb(trx, permissions, privs.privileges, userEntityId);
    }
    return qb;
  }

  static srGetCampaignsSummaryViewQb(
    trx: Transaction, userEntityId: string, privs: PrivilegeTypeV1, selectedInstance: string,
  ): QueryBuilder | null {
    let qb = null;
    if (privs.privileges) {
      const permissions = utGetAllPermissionValues({
        v: privs.privileges.campaign.permissions.v,
        e: privs.privileges.campaign.permissions.e,
        d: privs.privileges.campaign.permissions.d,
      } as Record<PermissionOptionTypes, string>);
      if (!privs.privileges.permissions.includes(PERMISSIONS.CAMPAIGN)) return null;
      if (permissions.includes(P_OPTION_ALL_IN_GROUP)) {
        qb = srGetCampSummaryAllInGroup(
          trx, permissions, privs.privileges, selectedInstance,
        );
      } else if (
        permissions.includes(P_OPTION_OWN_IN_GROUP)
        || privs.privileges.campaign.permissions?.c === P_OPTION_ALL_IN_GROUP
      ) {
        qb = srGetCampSummaryOwnInGroup(trx, {
          permissions, privileges: privs.privileges, userEntityId, selectedInstance,
        });
      }
    }
    return qb;
  }

  static srGetSupplierCampaignListViewQb(
    trx: Transaction, privs: PrivilegeTypeV1,
  ): QueryBuilder | null {
    let qb = null;
    if (privs.privileges) {
      const permissions = utGetAllPermissionValues({
        v: privs.privileges.campaign.permissions.v,
        e: privs.privileges.campaign.permissions.e,
        d: privs.privileges.campaign.permissions.d,
      } as Record<PermissionOptionTypes, string>);

      if (!privs.privileges.permissions.includes(PERMISSIONS.CAMPAIGN)) return null;
      if (permissions.includes(P_OPTION_ALL_IN_GROUP)) {
        qb = srGetViewAllInGroupSupplierQb(
          trx, permissions, privs.privileges,
        );
      }
    }
    return qb;
  }

  static async canUpdateCampaignDetails(
    trx: Transaction,
    params: {
      userEntityId: string, updatingCampId: string, privs: PrivilegeTypeV1, updatingCampInstanceId: string
    },
  ): Promise<null | QueryBuilder> {
    let qb = null;
    const {
      privs, userEntityId, updatingCampId, updatingCampInstanceId,
    } = params;
    if (privs.privileges) {
      const permissions = utGetAllPermissionValues({
        e: privs.privileges.campaign.permissions.e,
      } as Record<PermissionOptionTypes, string>);
      if (!privs.privileges.permissions.includes(PERMISSIONS.CAMPAIGN)) return null;
      if (permissions.includes(P_OPTION_ALL_IN_GROUP)) {
        qb = srGetUpdateAllInGroup(
          privs.privileges, permissions, updatingCampInstanceId,
        );
      }

      if (permissions.includes(P_OPTION_OWN_IN_GROUP)
        || privs.privileges.campaign.permissions?.c === P_OPTION_ALL_IN_GROUP
      ) {
        qb = srGetUpdateOwnInGroup(trx, {
          userEntityId, updatingCampInstanceId, updatingCampId, privileges: privs.privileges, permissions,
        });
      }
    }

    return qb;
  }

  static async canUpdateSupplierCampaignDetails(
    trx: Transaction,
    privs: PrivilegeTypeV1,
    selectedInstance: string,
  ): Promise<null | QueryBuilder> {
    let qb = null;
    if (privs.privileges) {
      const permissions = utGetAllPermissionValues({
        e: privs.privileges.campaign.permissions.e,
      } as Record<PermissionOptionTypes, string>);

      if (!privs.privileges.permissions.includes(PERMISSIONS.CAMPAIGN)
        || permissions.includes(P_OPTION_OWN_IN_GROUP)) return null;
      if (permissions.includes(P_OPTION_ALL_IN_GROUP)) {
        qb = srGetUpdateAllInGroupForSupplier(
          trx, privs.privileges, permissions, selectedInstance,
        );
      }
    }

    return qb;
  }
}

export default SrAclGuardCampaign;
