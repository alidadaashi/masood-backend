import { QueryBuilder, Transaction } from "knex";
import { PermissionOptionTypes, PrivilegeTypeV1 } from "../module/shared/types/tpShared";
import {
  utCanDeleteAssigned, utCanDeleteOwnInDomain, utCanUpdateOwnInDomain, utCanViewAssigned, utIsDomainGroupAdmin, utIsItgAdmin,
} from "../module/shared/utils/utAuth";
import DoGroup from "../module/entities/group/doGroupDetails";
import {
  P_OPTION_ALL_IN_DOMAIN, P_OPTION_OWN_IN_DOMAIN, P_OPTION_YES,
} from "../module/shared/constants/dtPermissionConstants";
import MdGroupDetails from "../module/entities/group/mdGroupDetails";
import MdEntityUser from "../module/entity/entityUser/mdEntityUser";
import MdUser from "../module/user/mdUser";
import DoUser from "../module/user/doUser";
import MdCreatorEntity from "../module/entities/creatorEntity/mdCreatorEntity";
import {
  utGetAllIdsFromPermissionOfTypeForGroupUser, utGetAllPermissionValues, utGetPermissionKeyWhereTypeIs,
} from "./utAclHelper";

const srGetDataForQueryByPrivileges = (
  privileges: PrivilegeTypeV1["privileges"], permissions: string[], optionType: string,
): { allDomainsIds: string[], yesGroupIds?: string[] } | null => {
  const permissionKey = utGetPermissionKeyWhereTypeIs(privileges.groupUser.permissions, optionType);
  const allInDomainsIds = utGetAllIdsFromPermissionOfTypeForGroupUser(privileges.groupUser, permissionKey, optionType);
  if (allInDomainsIds.length) {
    if (permissions.includes(P_OPTION_YES)) {
      const yesPermissionKey = utGetPermissionKeyWhereTypeIs(privileges.groupUser.permissions, P_OPTION_YES);
      const yesGroupIds = utGetAllIdsFromPermissionOfTypeForGroupUser(privileges.groupUser, yesPermissionKey, P_OPTION_YES);
      return { allDomainsIds: allInDomainsIds, yesGroupIds };
    }
    return { allDomainsIds: allInDomainsIds };
  }
  return null;
};

const srGetViewAllInGroupQb = (
  trx: Transaction, permissions: string[], privileges: PrivilegeTypeV1["privileges"],
) => {
  const data = srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_ALL_IN_DOMAIN);
  if (data) {
    if (data.yesGroupIds?.length) {
      const groupIds = data.yesGroupIds;
      return DoGroup.getDefaultGroupUserQb(trx)
        .where((qbWhere) => qbWhere
          .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds)
          .orWhereIn(MdGroupDetails.col("gEntityId"), groupIds))
        .groupBy(MdGroupDetails.col("gEntityId"));
    }
    return DoGroup.getDefaultGroupUserQb(trx)
      .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds);
  }
  return null;
};

const srGetViewOwnInGroupQb = (
  trx: Transaction, permissions: string[], privileges: PrivilegeTypeV1["privileges"], userEntityId: string,
) => {
  const data = !permissions.includes(P_OPTION_OWN_IN_DOMAIN)
  && privileges.groupUser.permissions?.c === P_OPTION_ALL_IN_DOMAIN
    ? srGetDataForQueryByPrivileges(privileges, [...permissions, P_OPTION_ALL_IN_DOMAIN],
      P_OPTION_ALL_IN_DOMAIN)
    : srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_OWN_IN_DOMAIN);
  if (data) {
    if (data.yesGroupIds?.length) {
      const groupIds = data.yesGroupIds;
      return DoGroup.getDefaultGroupUserQb(trx)
        .where((qbWhere) => qbWhere
          .where((qbWhere1) => {
            qbWhere1.where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
              .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds);
          })
          .orWhereIn(MdGroupDetails.col("gEntityId"), groupIds))
        .groupBy(MdGroupDetails.col("gEntityId"));
    }
    return DoGroup.getDefaultGroupUserQb(trx)
      .where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
      .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds);
  }

  return null;
};

const srGetViewAssignedInGroup = (
  trx: Transaction, privileges: PrivilegeTypeV1["privileges"],
) => {
  const yesPermissionKey = utGetPermissionKeyWhereTypeIs(privileges.groupUser.permissions, P_OPTION_YES);
  const yesGroupIds = utGetAllIdsFromPermissionOfTypeForGroupUser(privileges.groupUser, yesPermissionKey, P_OPTION_YES);

  if (yesGroupIds?.length) {
    return DoGroup.getDefaultGroupUserQb(trx)
      .whereIn(MdGroupDetails.col("gEntityId"), yesGroupIds);
  }

  return null;
};

const srGetUpdateAllInGroup = async (
  trx: Transaction, privileges: PrivilegeTypeV1["privileges"], permissions: string[], updatingUserEntityId: string,
) => {
  const data = srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_ALL_IN_DOMAIN);
  if (data) {
    if (data.yesGroupIds?.length) {
      return !!await DoGroup.getDefaultGroupUserQb(trx)
        .where((qbWhere) => qbWhere
          .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds)
          .andWhere(MdEntityUser.col("euUserEntityId"), updatingUserEntityId)
          .orWhereIn(MdGroupDetails.col("gEntityId"), data.yesGroupIds as string[])).first();
    }
    return !!await DoGroup.getDefaultGroupUserQb(trx)
      .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds)
      .andWhere(MdEntityUser.col("euUserEntityId"), updatingUserEntityId).first();
  }

  return null;
};

const srGetUpdateOwnInGroup = async (trx: Transaction, params: {
  privileges: PrivilegeTypeV1["privileges"], permissions: string[], updatingUserEntityId: string, userEntityId: string,
}) => {
  const {
    privileges, permissions, updatingUserEntityId, userEntityId,
  } = params;
  const data = !permissions.includes(P_OPTION_OWN_IN_DOMAIN)
  && privileges.groupUser.permissions?.c === P_OPTION_ALL_IN_DOMAIN
    ? srGetDataForQueryByPrivileges(privileges, [...permissions, P_OPTION_ALL_IN_DOMAIN], P_OPTION_ALL_IN_DOMAIN)
    : srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_OWN_IN_DOMAIN);
  if (data) {
    if (data.yesGroupIds?.length) {
      return !!await DoGroup.getDefaultGroupUserQb(trx)
        .where((qbWhere) => qbWhere
          .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds)
          .andWhere(MdEntityUser.col("euUserEntityId"), updatingUserEntityId)
          .andWhere(MdCreatorEntity.col("ceCreatorId"), userEntityId)
          .orWhereIn(MdGroupDetails.col("gEntityId"), data.yesGroupIds as string[])).first();
    }
    return !!await DoGroup.getDefaultGroupUserQb(trx)
      .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds)
      .andWhere(MdEntityUser.col("euUserEntityId"), updatingUserEntityId)
      .andWhere(MdCreatorEntity.col("ceCreatorId"), userEntityId)
      .first();
  }

  return null;
};

const srGetUpdateAssignedQb = async (
  trx: Transaction, privileges: PrivilegeTypeV1["privileges"], updatingUserEntityId: string,
) => {
  const yesPermissionKey = utGetPermissionKeyWhereTypeIs(privileges.groupUser.permissions, P_OPTION_YES);
  const yesGroupIds = utGetAllIdsFromPermissionOfTypeForGroupUser(privileges.groupUser, yesPermissionKey, P_OPTION_YES);

  if (yesGroupIds?.length) {
    return !!await DoGroup.getDefaultGroupUserQb(trx)
      .andWhere(MdEntityUser.col("euUserEntityId"), updatingUserEntityId)
      .whereIn(MdGroupDetails.col("gEntityId"), yesGroupIds as string[]).first();
  }

  return null;
};

const srGetDeleteAllInGroupQb = async (
  trx: Transaction, privileges: PrivilegeTypeV1["privileges"], permissions: string[], deletingGroupUserEntityId: string,
) => {
  const data = srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_ALL_IN_DOMAIN);
  if (data) {
    if (data.yesGroupIds?.length) {
      return !!await DoGroup.getDefaultGroupUserQb(trx)
        .where((qbWhere) => qbWhere
          .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds)
          .andWhere(MdEntityUser.col("euUserEntityId"), deletingGroupUserEntityId)
          .orWhereIn(MdGroupDetails.col("gEntityId"), data.yesGroupIds as string[])).first();
    }
    return !!await DoGroup.getDefaultGroupUserQb(trx)
      .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds)
      .andWhere(MdEntityUser.col("euUserEntityId"), deletingGroupUserEntityId)
      .first();
  }

  return null;
};

const srGetDeleteOwnInGroup = async (trx: Transaction, params: {
  privileges: PrivilegeTypeV1["privileges"], permissions: string[],
  deletingGroupUserEntityId: string, userEntityId: string,
}) => {
  const {
    deletingGroupUserEntityId,
    userEntityId,
    permissions,
    privileges,
  } = params;
  const data = !permissions.includes(P_OPTION_OWN_IN_DOMAIN)
  && privileges.groupUser.permissions?.c === P_OPTION_ALL_IN_DOMAIN
    ? srGetDataForQueryByPrivileges(privileges, [...permissions, P_OPTION_ALL_IN_DOMAIN], P_OPTION_ALL_IN_DOMAIN)
    : srGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_OWN_IN_DOMAIN);
  if (data) {
    if (data.yesGroupIds?.length) {
      return !!await DoGroup.getDefaultGroupUserQb(trx)
        .where((qbWhere) => qbWhere
          .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds)
          .andWhere(MdEntityUser.col("euUserEntityId"), deletingGroupUserEntityId)
          .andWhere(MdCreatorEntity.col("ceCreatorId"), userEntityId)
          .orWhereIn(MdGroupDetails.col("gEntityId"), data.yesGroupIds as string[]))
        .first();
    }
    return !!await DoGroup.getDefaultGroupUserQb(trx)
      .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds)
      .andWhere(MdEntityUser.col("euUserEntityId"), deletingGroupUserEntityId)
      .andWhere(MdCreatorEntity.col("ceCreatorId"), userEntityId)
      .first();
  }

  return null;
};

const stGetDeleteAssignedInGroup = async (
  trx: Transaction, privileges: PrivilegeTypeV1["privileges"], deletingGroupUserEntityId: string,
) => {
  const yesPermissionKey = utGetPermissionKeyWhereTypeIs(privileges.groupUser.permissions, P_OPTION_YES);
  const yesGroupIds = utGetAllIdsFromPermissionOfTypeForGroupUser(privileges.groupUser, yesPermissionKey, P_OPTION_YES);

  if (yesGroupIds?.length) {
    return !!await DoGroup.getDefaultGroupUserQb(trx)
      .andWhere(MdEntityUser.col("euUserEntityId"), deletingGroupUserEntityId)
      .whereIn(MdGroupDetails.col("gEntityId"), yesGroupIds as string[]).first();
  }

  return null;
};

class SrAclGuardGroupUser {
  static srGetGroupUserListViewQb(
    trx: Transaction, userEntityId: string, privs: PrivilegeTypeV1,
  ): QueryBuilder | null {
    let qb = null;
    if (privs.privileges) {
      if (utIsItgAdmin(privs)) {
        return DoUser.getDefaultQb(trx)
          .leftJoin(MdEntityUser.TABLE_NAME, MdEntityUser.col("euUserEntityId"), MdUser.col("uEntityId"));
      }

      const permissions = utGetAllPermissionValues({
        v: privs.privileges.groupUser.permissions.v,
        e: privs.privileges.groupUser.permissions.e,
        d: privs.privileges.groupUser.permissions.d,
      } as Record<PermissionOptionTypes, string>);

      if (utIsDomainGroupAdmin(permissions)) qb = srGetViewAllInGroupQb(trx, permissions, privs.privileges);
      else if (
        permissions.includes(P_OPTION_OWN_IN_DOMAIN)
        || privs.privileges.groupUser.permissions?.c === P_OPTION_ALL_IN_DOMAIN
      ) qb = srGetViewOwnInGroupQb(trx, permissions, privs.privileges, userEntityId);

      if (!qb && utCanViewAssigned(permissions)) qb = srGetViewAssignedInGroup(trx, privs.privileges);
    }

    return qb;
  }

  static async srCanUpdateGroupUser(
    trx: Transaction, userEntityId: string, updatingUserEntityId: string, privs: PrivilegeTypeV1,
  ): Promise<null | QueryBuilder> {
    let qb = null;
    if (privs.privileges) {
      if (utIsItgAdmin(privs)) return true;
      const permissions = utGetAllPermissionValues({
        e: privs.privileges.groupUser.permissions.e,
      } as Record<PermissionOptionTypes, string>);

      if (utIsDomainGroupAdmin(permissions)) {
        qb = srGetUpdateAllInGroup(trx, privs.privileges, permissions, updatingUserEntityId);
      } else
      if (utCanUpdateOwnInDomain(permissions) || privs.privileges.groupUser.permissions?.c === P_OPTION_ALL_IN_DOMAIN) {
        qb = srGetUpdateOwnInGroup(trx, {
          privileges: privs.privileges, permissions, updatingUserEntityId, userEntityId,
        });
      }

      if (!qb && permissions.includes(P_OPTION_YES)) qb = srGetUpdateAssignedQb(trx, privs.privileges, updatingUserEntityId);
    }

    return qb;
  }

  static async srCanDeleteGroupUser(
    trx: Transaction, userEntityId: string, deletingGroupUserEntityId: string, privs: PrivilegeTypeV1,
  ): Promise<null | QueryBuilder> {
    let qb = null;
    if (privs.privileges) {
      if (utIsItgAdmin(privs)) return true;
      const permissions = utGetAllPermissionValues(
        { d: privs.privileges.groupUser.permissions.d } as Record<PermissionOptionTypes, string>,
      );

      if (utIsDomainGroupAdmin(permissions)) {
        qb = srGetDeleteAllInGroupQb(trx, privs.privileges, permissions, deletingGroupUserEntityId);
      } else if (
        utCanDeleteOwnInDomain(permissions) || privs.privileges.groupUser.permissions?.c === P_OPTION_ALL_IN_DOMAIN
      ) {
        qb = srGetDeleteOwnInGroup(trx, {
          privileges: privs.privileges, permissions, deletingGroupUserEntityId, userEntityId,
        });
      }

      if (!qb && utCanDeleteAssigned(permissions)) {
        qb = stGetDeleteAssignedInGroup(trx, privs.privileges, deletingGroupUserEntityId);
      }
    }

    return qb;
  }

  static async srCanCreateGroupUser(
    trx: Transaction, userEntityId: string, groupEntityId: string, privs: PrivilegeTypeV1,
  ): Promise<boolean> {
    const { privileges } = privs;
    if (privileges) {
      const permissions = Object.values({ c: privileges.groupUser.permissions.c } as Record<PermissionOptionTypes, string>);

      if (utIsItgAdmin(privs)) return true;

      if (userEntityId && groupEntityId && utIsDomainGroupAdmin(permissions)) {
        const ownPermissionKey = utGetPermissionKeyWhereTypeIs(privileges.groupUser.permissions, P_OPTION_ALL_IN_DOMAIN);
        const ownDomainIds = utGetAllIdsFromPermissionOfTypeForGroupUser(privileges.groupUser,
          ownPermissionKey, P_OPTION_ALL_IN_DOMAIN);

        if (ownDomainIds?.length) {
          return !!await DoGroup.getDefaultGroupUserQb(trx)
            .whereIn(MdGroupDetails.col("gDomainEntityId"), ownDomainIds)
            .andWhere(MdEntityUser.col("euUserEntityId"), groupEntityId)
            .andWhere(MdCreatorEntity.col("ceCreatorId"), userEntityId);
        }
      }
    }

    return false;
  }
}

export default SrAclGuardGroupUser;
