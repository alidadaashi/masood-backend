import { QueryBuilder, Transaction } from "knex";
import { PermissionOptionTypes, PrivilegeTypeV1 } from "../module/shared/types/tpShared";
import {
  P_OPTION_ALL_IN_DOMAIN, P_OPTION_OWN_IN_DOMAIN, P_OPTION_YES,
} from "../module/shared/constants/dtPermissionConstants";
import DoGroup from "../module/entities/group/doGroupDetails";
import MdGroupDetails from "../module/entities/group/mdGroupDetails";
import MdCreatorEntity from "../module/entities/creatorEntity/mdCreatorEntity";
import DoDomain from "../module/entities/domain/doDomainDetails";
import MdDomainDetails from "../module/entities/domain/mdDomainDetails";
import {
  utCanDeleteAssigned, utCanDeleteOwnInDomain, utCanUpdateAssigned, utCanUpdateOwnInDomain, utCanViewOwnInDomain,
  utIsDomainGroupAdmin, utIsItgAdmin,
} from "../module/shared/utils/utAuth";
import {
  utGetAllIdsFromPermissionOfType, utGetAllPermissionValues, utGetDataForQueryByPrivileges, utGetPermissionKeyWhereTypeIs,
} from "./utAclHelper";

const srGetViewAllInDomainQb = (
  trx: Transaction,
  permissions: string[],
  privileges: PrivilegeTypeV1["privileges"],
) => {
  const data = utGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_ALL_IN_DOMAIN);
  if (data) {
    if (data.yesGroupIds?.length) {
      const groupIds = data.yesGroupIds;
      return DoGroup.getDefaultQb(trx)
        .where((qbWhere) => qbWhere
          .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds)
          .orWhereIn(MdGroupDetails.col("gEntityId"), groupIds))
        .groupBy(MdGroupDetails.col("gEntityId"));
    }
    return DoGroup.getDefaultQb(trx)
      .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds);
  }

  return null;
};

const srGetViewOwnInDomainQb = (
  trx: Transaction,
  permissions: string[],
  privileges: PrivilegeTypeV1["privileges"],
  userEntityId: string,
) => {
  const data = !permissions.includes(P_OPTION_OWN_IN_DOMAIN)
  && privileges.group.permissions?.c === P_OPTION_ALL_IN_DOMAIN
    ? utGetDataForQueryByPrivileges(privileges, [...permissions, P_OPTION_ALL_IN_DOMAIN], P_OPTION_ALL_IN_DOMAIN)
    : utGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_OWN_IN_DOMAIN);
  if (data) {
    if (data.yesGroupIds?.length) {
      const groupIds = data.yesGroupIds;
      return DoGroup.getDefaultQb(trx)
        .where((qbWhere) => qbWhere
          .where((qbWhere1) => {
            qbWhere1
              .where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
              .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds);
          })
          .orWhereIn(MdGroupDetails.col("gEntityId"), groupIds))
        .groupBy(MdGroupDetails.col("gEntityId"));
    }
    return DoGroup.getDefaultQb(trx)
      .where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
      .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds);
  }
  return null;
};

const srGetViewAssignedQb = (
  trx: Transaction,
  permissions: string[],
  privileges: PrivilegeTypeV1["privileges"],
) => {
  const yesPermissionKey = utGetPermissionKeyWhereTypeIs(privileges.group.permissions, P_OPTION_YES);
  const yesGroupIds = utGetAllIdsFromPermissionOfType(privileges.group, yesPermissionKey, P_OPTION_YES);

  if (yesGroupIds?.length) {
    return DoGroup.getDefaultQb(trx)
      .whereIn(MdGroupDetails.col("gEntityId"), yesGroupIds);
  }

  return null;
};

const srGetUpdateOwnInDomainQb = async (
  trx: Transaction,
  params: {
    userEntityId: string,
    updatingGroupDomainEntityId: string,
    updatingGroupEntityId: string,
    privs: PrivilegeTypeV1,
    permissions: string[]
  },
) => {
  const data = !params.permissions.includes(P_OPTION_OWN_IN_DOMAIN)
  && params.privs.privileges.group.permissions?.c === P_OPTION_ALL_IN_DOMAIN
    ? utGetDataForQueryByPrivileges(params.privs.privileges, [...params.permissions, P_OPTION_ALL_IN_DOMAIN],
      P_OPTION_ALL_IN_DOMAIN)
    : utGetDataForQueryByPrivileges(params.privs.privileges, params.permissions, P_OPTION_OWN_IN_DOMAIN);
  if (data) {
    if (data.yesGroupIds?.includes(params.updatingGroupEntityId)) {
      const isFound = data.yesGroupIds.includes(params.updatingGroupEntityId);
      return isFound || data.allDomainsIds.includes(params.updatingGroupDomainEntityId);
    }
    return !!await DoGroup.getDefaultQb(trx)
      .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds)
      .where(MdCreatorEntity.col("ceCreatorId"), params.userEntityId)
      .andWhere(MdCreatorEntity.col("ceEntityId"), params.updatingGroupEntityId)
      .first();
  }

  return null;
};

const srGetUpdateAssignedQb = (
  trx: Transaction,
  privs: PrivilegeTypeV1["privileges"],
  updatingGroupEntityId: string,
) => {
  const yesPermissionKey = utGetPermissionKeyWhereTypeIs(privs.group.permissions, P_OPTION_YES);
  const yesGroupIds = utGetAllIdsFromPermissionOfType(privs.group, yesPermissionKey, P_OPTION_YES);

  if (yesGroupIds?.length) {
    return yesGroupIds.includes(updatingGroupEntityId);
  }

  return null;
};

const srGetAllInDomainQb = (
  privs: PrivilegeTypeV1["privileges"],
  permissions: string[],
  updatingGroupEntityId: string,
  updatingGroupDomainEntityId: string,
) => {
  const data = utGetDataForQueryByPrivileges(privs, permissions, P_OPTION_ALL_IN_DOMAIN);
  if (data) {
    const isFound = data.yesGroupIds?.length && data.yesGroupIds.includes(updatingGroupEntityId);
    return isFound || data.allDomainsIds.includes(updatingGroupDomainEntityId);
  }
  return null;
};

const srGetDeleteAssignedQb = (
  privs: PrivilegeTypeV1["privileges"],
  deletingGroupEntityId: string,
) => {
  const yesPermissionKey = utGetPermissionKeyWhereTypeIs(privs.group.permissions, P_OPTION_YES);
  const yesGroupIds = utGetAllIdsFromPermissionOfType(privs.group, yesPermissionKey, P_OPTION_YES);

  if (yesGroupIds?.length) {
    return yesGroupIds.includes(deletingGroupEntityId);
  }

  return null;
};

const srGetDeleteOwnInDomainQb = async (
  trx: Transaction,
  params: {
    userEntityId: string,
    deletingGroupDomainEntityId: string,
    deletingGroupEntityId: string,
    privs: PrivilegeTypeV1,
    permissions: string[]
  },
) => {
  const data = utGetDataForQueryByPrivileges(params.privs.privileges, params.permissions, P_OPTION_OWN_IN_DOMAIN);
  if (data) {
    if (data.yesGroupIds?.includes(params.deletingGroupEntityId)) {
      const isFound = data.yesGroupIds.includes(params.deletingGroupEntityId);
      return isFound || data.allDomainsIds.includes(params.deletingGroupDomainEntityId);
    }
    return !!await DoGroup.getDefaultQb(trx)
      .whereIn(MdGroupDetails.col("gDomainEntityId"), data.allDomainsIds)
      .where(MdCreatorEntity.col("ceCreatorId"), params.userEntityId)
      .andWhere(MdCreatorEntity.col("ceEntityId"), params.deletingGroupEntityId)
      .first();
  }

  return null;
};

const srGetDeleteAllInDomainQb = (
  privs: PrivilegeTypeV1["privileges"],
  permissions: string[],
  deletingGroupEntityId: string,
  deletingGroupDomainEntityId: string,
) => {
  const data = utGetDataForQueryByPrivileges(privs, permissions, P_OPTION_ALL_IN_DOMAIN);
  if (data) {
    const isFound = data.yesGroupIds?.length && data.yesGroupIds.includes(deletingGroupEntityId);
    return isFound || data.allDomainsIds.includes(deletingGroupDomainEntityId);
  }
  return null;
};

class SrAclGuardGroup {
  static getGroupListViewQb(
    trx: Transaction,
    userEntityId: string,
    privs: PrivilegeTypeV1,
  ): QueryBuilder | null {
    const { privileges } = privs;
    let qb = null;
    if (privileges) {
      if (utIsItgAdmin(privs)) return DoGroup.getDefaultQb(trx);
      const permissions = utGetAllPermissionValues({
        v: privileges.group.permissions.v,
        e: privileges.group.permissions.e,
        d: privileges.group.permissions.d,
      } as Record<PermissionOptionTypes, string>);
      if (utIsDomainGroupAdmin(permissions)) {
        qb = srGetViewAllInDomainQb(trx, permissions, privileges);
      } else if (utCanViewOwnInDomain(permissions) || privileges.group.permissions?.c === P_OPTION_ALL_IN_DOMAIN) {
        qb = srGetViewOwnInDomainQb(trx, permissions, privileges, userEntityId);
      }

      if (!qb && permissions.includes(P_OPTION_YES)) qb = srGetViewAssignedQb(trx, permissions, privileges);
    }

    return qb;
  }

  static async canUpdateGroup(
    trx: Transaction,
    params: {
      userEntityId: string, updatingGroupDomainEntityId: string, updatingGroupEntityId: string, privs: PrivilegeTypeV1,
    },
  ): Promise<null | QueryBuilder> {
    let qb = null;
    if (params.privs.privileges) {
      if (utIsItgAdmin(params.privs)) return DoGroup.getDefaultQb(trx);

      const permissions = utGetAllPermissionValues({
        e: params.privs.privileges.group.permissions.e,
      } as Record<PermissionOptionTypes, string>);

      if (utIsDomainGroupAdmin(permissions)) {
        qb = srGetAllInDomainQb(params.privs.privileges, permissions, params.updatingGroupEntityId,
          params.updatingGroupDomainEntityId);
      } else if (utCanUpdateOwnInDomain(permissions)
        || params.privs.privileges.group.permissions?.c === P_OPTION_ALL_IN_DOMAIN) {
        qb = srGetUpdateOwnInDomainQb(trx, {
          ...params,
          permissions,
        });
      }

      if (!qb && utCanUpdateAssigned(permissions)) {
        qb = srGetUpdateAssignedQb(trx, params.privs.privileges, params.updatingGroupEntityId);
      }
    }

    return qb;
  }

  static async canDeleteGroup(trx: Transaction, params: {
      userEntityId: string, deletingGroupDomainEntityId: string, deletingGroupEntityId: string, privs: PrivilegeTypeV1,
  }): Promise<null | QueryBuilder> {
    let qb = null;
    if (params.privs.privileges) {
      if (utIsItgAdmin(params.privs)) return DoGroup.getDefaultQb(trx);
      const permissions = utGetAllPermissionValues({
        d: params.privs.privileges.group.permissions.d,
      } as Record<PermissionOptionTypes, string>);

      if (utIsDomainGroupAdmin(permissions)) {
        qb = srGetDeleteAllInDomainQb(params.privs.privileges,
          permissions, params.deletingGroupEntityId, params.deletingGroupDomainEntityId);
      } else if (utCanDeleteOwnInDomain(permissions)) {
        qb = srGetDeleteOwnInDomainQb(trx, {
          ...params,
          permissions,
        });
      }
      if (!qb && utCanDeleteAssigned(permissions)) {
        qb = srGetDeleteAssignedQb(params.privs.privileges, params.deletingGroupEntityId);
      }
    }

    return qb;
  }

  static canCreateGroup(groupParentDomainEntityId: string, privs: PrivilegeTypeV1): boolean {
    const { privileges } = privs;
    if (privileges) {
      if (utIsItgAdmin(privs)) return true;
      const permissions = utGetAllPermissionValues({
        c: privileges.group.permissions.c,
      } as Record<PermissionOptionTypes, string>);

      if (utIsDomainGroupAdmin(permissions)) {
        const data = utGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_ALL_IN_DOMAIN);
        if (data?.allDomainsIds?.length && data?.allDomainsIds.includes(groupParentDomainEntityId)) {
          return true;
        }
      }
    }

    return false;
  }

  static getAssignedDomainsListViewQb(trx: Transaction, privs: PrivilegeTypeV1): QueryBuilder | null {
    const { privileges } = privs;
    if (privileges) {
      if (utIsItgAdmin(privs)) return DoDomain.getDefaultQb(trx);
      const permissions = utGetAllPermissionValues({
        c: privileges.group.permissions.c,
      } as Record<PermissionOptionTypes, string>);

      if (utIsDomainGroupAdmin(permissions)) {
        const data = utGetDataForQueryByPrivileges(privileges, permissions, P_OPTION_ALL_IN_DOMAIN);
        if (data?.allDomainsIds?.length) {
          return DoDomain.getDefaultQb(trx)
            .whereIn(MdDomainDetails.col("dEntityId"), data.allDomainsIds);
        }
      }
    }

    return null;
  }
}

export default SrAclGuardGroup;
