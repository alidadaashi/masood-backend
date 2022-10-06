import { QueryBuilder, Transaction } from "knex";
import {
  EntityTypes, tpGetType, PermissionOptionTypes, PrivilegeTypeV1,
} from "../module/shared/types/tpShared";
import { P_OPTION_ALL_IN_SYSTEM, P_OPTION_YES, PERMISSIONS } from "../module/shared/constants/dtPermissionConstants";
import MdCreatorEntity from "../module/entities/creatorEntity/mdCreatorEntity";
import DoUser from "../module/user/doUser";
import DomainDao from "../module/entities/domain/doDomainDetails";
import MdDomainDetails from "../module/entities/domain/mdDomainDetails";
import MdEntityUser from "../module/entity/entityUser/mdEntityUser";
import {
  utCanDeleteAssigned,
  utCanDeleteOwn,
  utCanUpdateAssigned,
  utCanUpdateOwn,
  utCanViewAssigned,
  utCanViewOwn,
  utIsDomainAdmin,
  utIsItgAdmin,
} from "../module/shared/utils/utAuth";
import MdUser from "../module/user/mdUser";

const srGetYesDomainUsersEntitiesId = (privileges: PrivilegeTypeV1["privileges"]) => {
  const yesOptionKey: PermissionOptionTypes = Object.keys(privileges.domainUser.permissions)
    .find((p) => (privileges.domainUser.permissions)[p] === P_OPTION_YES) as PermissionOptionTypes;
  if (yesOptionKey && privileges.domainUser[yesOptionKey]) {
    const domainEntityIds = Object.keys(privileges.domainUser[yesOptionKey]);
    return domainEntityIds.length ? domainEntityIds : [];
  }
  return [];
};

const srBuildOwnQuery = (
  trx: Transaction, userEntityId: string, updatingDomainUserEntityId: string,
) => DomainDao.getDefaultDomainUserQb(trx)
  .join(MdCreatorEntity.TABLE_NAME, MdCreatorEntity.col("ceEntityId"), MdEntityUser.col("euEntityId"))
  .where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
  .andWhere(MdEntityUser.col("euUserEntityId"), updatingDomainUserEntityId)
  .andWhere(MdCreatorEntity.col("ceEntityType"), tpGetType<EntityTypes>("domain"))
  .first();

const srBuildViewQueryForAssignedEntities = (
  trx: Transaction,
  privs: PrivilegeTypeV1,
): QueryBuilder | null => {
  const yesDomainEntitiesId = srGetYesDomainUsersEntitiesId(privs.privileges);
  if (yesDomainEntitiesId?.length) {
    const qb = DomainDao.getDefaultDomainUserQb(trx);
    qb.whereIn(MdDomainDetails.col("dEntityId"), yesDomainEntitiesId)
      .groupBy(MdDomainDetails.col("dEntityId"));
    return qb;
  }
  return null;
};

const srBuildOwnOrAndAssignedQuery = (
  trx: Transaction,
  privs: PrivilegeTypeV1,
  permissions: string[],
  userEntityId: string,
) => {
  const yesDomainEntitiesId = srGetYesDomainUsersEntitiesId(privs.privileges);
  const qb = DomainDao.getDefaultDomainUserQb(trx)
    .join(MdCreatorEntity.TABLE_NAME, MdCreatorEntity.col("ceEntityId"), MdDomainDetails.col("dEntityId"));
  if (utCanViewAssigned(permissions) && yesDomainEntitiesId?.length) {
    qb.where((qbWhere) => (
      qbWhere
        .where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
        .andWhere(MdCreatorEntity.col("ceEntityType"), tpGetType<EntityTypes>("domain")))
      .orWhereIn(MdDomainDetails.col("dEntityId"), yesDomainEntitiesId))
      .groupBy(MdDomainDetails.col("dEntityId"));
  } else {
    qb.where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
      .andWhere(MdCreatorEntity.col("ceEntityType"), tpGetType<EntityTypes>("domain"));
  }

  return qb;
};

const srGetViewPermissions = (privs: PrivilegeTypeV1) => {
  const mutatedPermissions: Record<PermissionOptionTypes, string> = {
    v: privs.privileges.domainUser.permissions.v,
    e: privs.privileges.domainUser.permissions.e,
    d: privs.privileges.domainUser.permissions.d,
  } as Record<PermissionOptionTypes, string>;
  return Object.values(mutatedPermissions);
};

class SrAclGuardDomainUser {
  static getDomainUserListViewQb(trx: Transaction, userEntityId: string, privs: PrivilegeTypeV1): QueryBuilder | null {
    if (privs.privileges) {
      const permissions = srGetViewPermissions(privs);

      if (utIsItgAdmin(privs)) {
        return DoUser
          .getDefaultQb(trx)
          .leftJoin(MdEntityUser.TABLE_NAME, MdEntityUser.col("euUserEntityId"), MdUser.col("uEntityId"));
      }

      if (utIsDomainAdmin(permissions)) return DomainDao.getDefaultDomainUserQb(trx);

      if (!privs.privileges.permissions.includes(PERMISSIONS.DOMAIN_USER)) return null;

      if (utCanViewOwn(permissions) || privs.privileges.domainUser?.permissions?.c === P_OPTION_ALL_IN_SYSTEM) {
        return srBuildOwnOrAndAssignedQuery(trx, privs, permissions, userEntityId);
      }
      if (utCanViewAssigned(permissions)) return srBuildViewQueryForAssignedEntities(trx, privs);
    }

    return null;
  }

  static async canUpdateDomainUser(
    trx: Transaction,
    userEntityId: string,
    updatingDomainUserEntityId: string,
    privs: PrivilegeTypeV1,
  ): Promise<boolean | null | QueryBuilder> {
    let qb = null;
    if (privs.privileges) {
      const mutatedPermissions: Record<PermissionOptionTypes, string> = {
        e: privs.privileges.domainUser.permissions.e,
      } as Record<PermissionOptionTypes, string>;
      const permissions = Object.values(mutatedPermissions);

      if (utIsItgAdmin(privs) || utIsDomainAdmin(permissions)) return true;

      if (
        utCanUpdateOwn(permissions)
        || privs.privileges.domainUser?.permissions?.c === P_OPTION_ALL_IN_SYSTEM
      ) {
        qb = !!await srBuildOwnQuery(trx, userEntityId, updatingDomainUserEntityId);
      }

      if (utCanUpdateAssigned(permissions) && !qb) {
        qb = !!await DomainDao.getDefaultDomainUserQb(trx)
          .whereIn(MdEntityUser.col("euEntityId"), srGetYesDomainUsersEntitiesId(privs.privileges))
          .andWhere(MdEntityUser.col("euUserEntityId"), updatingDomainUserEntityId)
          .first();
      }
    }

    return qb;
  }

  static async canDeleteDomainUser(
    trx: Transaction,
    userEntityId: string,
    updatingDomainUserEntityId: string,
    privs: PrivilegeTypeV1,
  ): Promise<boolean | null | QueryBuilder> {
    let qb = null;
    if (privs.privileges) {
      const mutatedPermissions: Record<PermissionOptionTypes, string> = {
        d: privs.privileges.domainUser.permissions.d,
      } as Record<PermissionOptionTypes, string>;
      const permissions = Object.values(mutatedPermissions);

      if (utIsItgAdmin(privs) || utIsDomainAdmin(permissions)) return true;

      if (utCanDeleteOwn(permissions)) {
        qb = !!await srBuildOwnQuery(trx, userEntityId, updatingDomainUserEntityId);
      }

      if (utCanDeleteAssigned(permissions) && !qb) {
        qb = !!await DomainDao.getDefaultDomainUserQb(trx)
          .whereIn(MdEntityUser.col("euEntityId"), srGetYesDomainUsersEntitiesId(privs.privileges))
          .andWhere(MdEntityUser.col("euUserEntityId"), updatingDomainUserEntityId)
          .first();
      }
    }

    return qb;
  }

  static async canCreateDomainUser(
    trx: Transaction,
    userEntityId: string,
    domainEntityId: string,
    privs: PrivilegeTypeV1,
  ): Promise<boolean> {
    const { privileges } = privs;
    if (privileges) {
      const mutatedPermissions: Record<PermissionOptionTypes, string> = {
        c: privileges.domainUser.permissions.c,
      } as Record<PermissionOptionTypes, string>;
      const permissions = Object.values(mutatedPermissions);

      if (utIsItgAdmin(privs)) return true;

      if (userEntityId && domainEntityId && utIsDomainAdmin(permissions)) {
        return !!await DomainDao.getDefaultDomainUserQb(trx)
          .join(MdCreatorEntity.TABLE_NAME, MdCreatorEntity.col("ceEntityId"), MdEntityUser.col("euEntityId"))
          .where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
          .andWhere(MdCreatorEntity.col("ceEntityId"), domainEntityId)
          .first();
      }
    }

    return false;
  }
}

export default SrAclGuardDomainUser;
