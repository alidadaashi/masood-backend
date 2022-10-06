import { QueryBuilder, Transaction } from "knex";
import { PermissionOptionTypes, PrivilegeTypeV1 } from "../module/shared/types/tpShared";
import { P_OPTION_ALL_IN_SYSTEM, P_OPTION_YES, PERMISSIONS } from "../module/shared/constants/dtPermissionConstants";
import MdDomainDetails from "../module/entities/domain/mdDomainDetails";
import MdCreatorEntity from "../module/entities/creatorEntity/mdCreatorEntity";
import DoDomain from "../module/entities/domain/doDomainDetails";
import {
  utCanDeleteAssigned,
  utCanDeleteOwn,
  utCanUpdateAssigned,
  utCanUpdateOwn,
  utCanViewAssigned,
  utCanViewOwn,
  utGetPermissionsFor,
  utIsDomainAdmin,
  utIsItgAdmin,
} from "../module/shared/utils/utAuth";

const srGetYesDomainEntitiesId = (privileges: PrivilegeTypeV1["privileges"]) => {
  const yesOptionKey: PermissionOptionTypes = Object.keys(privileges.domain.permissions)
    .find((p) => (privileges.domain.permissions)[p] === P_OPTION_YES) as PermissionOptionTypes;
  if (yesOptionKey && privileges.domain[yesOptionKey]) {
    const domainEntityIds = Object.keys(privileges.domain[yesOptionKey]);
    return domainEntityIds.length ? domainEntityIds : [];
  }
  return [];
};

const srGetViewQbForAssignedAndOwnDomains = (
  trx: Transaction, userEntityId: string, yesDomainEntitiesId: string[],
) => DoDomain
  .getDefaultQb(trx)
  .where((qbWhere) => qbWhere
    .andWhere(MdCreatorEntity.col("ceCreatorId"), userEntityId)
    .orWhereIn(MdDomainDetails.col("dEntityId"), yesDomainEntitiesId))
  .groupBy(MdDomainDetails.col("dEntityId"));

const srBuildViewOwnAndAssignedQb = (
  trx: Transaction,
  privileges: PrivilegeTypeV1["privileges"],
  permissions: string[],
  userEntityId: string,
) => {
  const yesDomainEntitiesId = srGetYesDomainEntitiesId(privileges);
  return (utCanViewAssigned(permissions) && yesDomainEntitiesId?.length)
    ? srGetViewQbForAssignedAndOwnDomains(trx, userEntityId, yesDomainEntitiesId)
    : DoDomain.getDefaultQb(trx)
      .where(MdCreatorEntity.col("ceCreatorId"), userEntityId);
};

const srBuildViewAssignedQb = (trx: Transaction, privileges: PrivilegeTypeV1["privileges"]) => {
  const yesDomainEntitiesId = srGetYesDomainEntitiesId(privileges);
  if (yesDomainEntitiesId?.length) {
    return DoDomain.getDefaultQb(trx)
      .whereIn(MdDomainDetails.col("dEntityId"), yesDomainEntitiesId)
      .groupBy(MdDomainDetails.col("dEntityId"));
  }
  return null;
};

class SrAclGuardDomain {
  static getDomainListViewQb(
    trx: Transaction,
    userEntityId: string,
    privs: PrivilegeTypeV1,
  ): QueryBuilder | null {
    let qb = null;
    if (privs.privileges) {
      const permissions = utGetPermissionsFor("domain", privs.privileges, ["v", "e", "d"]);
      if (utIsItgAdmin(privs) || utIsDomainAdmin(permissions)) return DoDomain.getDefaultQb(trx);
      if (!privs.privileges.permissions.includes(PERMISSIONS.DOMAIN)) return null;

      if (utCanViewOwn(permissions) || privs.privileges.domain?.permissions?.c === P_OPTION_ALL_IN_SYSTEM) {
        qb = srBuildViewOwnAndAssignedQb(trx, privs.privileges, permissions, userEntityId);
      } else if (utCanViewAssigned(permissions)) {
        qb = srBuildViewAssignedQb(trx, privs.privileges);
      }
    }

    return qb;
  }

  static async canUpdateDomain(
    trx: Transaction,
    userEntityId: string,
    updatingDomainEntityId: string,
    privs: PrivilegeTypeV1,
  ): Promise<null | QueryBuilder> {
    let qb = null;
    if (privs.privileges) {
      const permissions = utGetPermissionsFor("domain", privs.privileges, ["e"]);
      if (utIsItgAdmin(privs) || utIsDomainAdmin(permissions)) return true;

      const canCreate = privs.privileges.domain?.permissions?.c === P_OPTION_ALL_IN_SYSTEM;
      if (utCanUpdateOwn(permissions) || canCreate) {
        qb = !!await DoDomain.getDefaultQb(trx)
          .where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
          .andWhere(MdCreatorEntity.col("ceEntityId"), updatingDomainEntityId)
          .first();
      }

      if (utCanUpdateAssigned(permissions) && !qb) {
        qb = srGetYesDomainEntitiesId(privs.privileges)
          .includes(updatingDomainEntityId);
      }
    }

    return qb;
  }

  static async canDeleteDomain(
    trx: Transaction,
    userEntityId: string,
    updatingDomainEntityId: string,
    privs: PrivilegeTypeV1,
  ): Promise<boolean | QueryBuilder> {
    let qb = false;
    if (privs.privileges) {
      const permissions = utGetPermissionsFor("domain", privs.privileges, ["d"]);
      if (utIsItgAdmin(privs) || utIsDomainAdmin(permissions)) return true;

      if (utCanDeleteOwn(permissions)) {
        qb = !!await DoDomain.getDefaultQb(trx)
          .andWhere(MdCreatorEntity.col("ceEntityId"), updatingDomainEntityId)
          .where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
          .first();
      }

      if (utCanDeleteAssigned(permissions) && !qb) {
        qb = srGetYesDomainEntitiesId(privs.privileges)
          .includes(updatingDomainEntityId);
      }
    }
    return qb;
  }

  static canCreateDomain(
    userEntityId: string,
    privs: PrivilegeTypeV1,
  ): boolean {
    const { privileges } = privs;
    if (privileges) {
      const mutatedPermissions: Record<PermissionOptionTypes, string> = {
        c: privileges.domain.permissions.c,
      } as Record<PermissionOptionTypes, string>;
      const permissions = Object.values(mutatedPermissions);

      if (utIsItgAdmin(privs) || utIsDomainAdmin(permissions)) {
        return true;
      }
    }

    return false;
  }
}

export default SrAclGuardDomain;
