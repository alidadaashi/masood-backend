import { QueryBuilder, Transaction } from "knex";
import DoRolePermission from "./role/rolePrivilege/doRolePrivilege";
import DoProfileRole from "./profile/profileRole/doProfileRole";
import {
  AllUsersAllPrivilegesType,
  GetAllRolePermissionsType,
  PrivilegeTypeOptions,
  PrivilegeTypeV1,
  ReqBodyUserPrivilegesType,
  UserSessionType,
} from "../shared/types/tpShared";
import DoPrivileges from "./doPrivileges";
import DoPrivilegeDisplayUserRoleOrProfile from "./privilegeDisplayUserRoleOrProfile/doPrivilegeDisplayUserRoleOrProfile";
import PrivilegeUserRoleOrProfileModel from "./privilegeDisplayUserRoleOrProfile/mdPrivilegeUserRoleOrProfile";
import DoPrivilegeDisplayUserEntity from "./privilegeDisplayUserEntity/doPrivilegeUserEntity";
import MdPrivilegeUserEntity from "./privilegeDisplayUserEntity/mdPrivilegeUserEntity";
import UtPrivileges from "./utPrivileges";
import { utUpdateUserPrivilegesInSession } from "../shared/utils/utSession";
import MdProfile from "./profile/mdProfile";
import MdUser from "../user/mdUser";
import MdRole from "./role/mdRole";
import MdDomainDetails from "../entities/domain/mdDomainDetails";
import MdGroupDetails from "../entities/group/mdGroupDetails";
import DoEntityUser from "../entity/entityUser/doEntityUser";

const srUpdateUserPrivilegesProfiles = async (trx: Transaction, profiles: MdProfile[], user: MdUser) => {
  const privilegeDisplayUserRoles: PrivilegeUserRoleOrProfileModel[] = profiles
    .map((pdur) => ({
      purpProfileOrRoleId: pdur.pProfileId as string,
      purpUserEntityId: user.uEntityId,
      purpPrivilegeType: "profile",
    }));
  await DoPrivilegeDisplayUserRoleOrProfile.insertMany(trx, privilegeDisplayUserRoles);
};

const srUpdatePrivilegesRoles = async (trx: Transaction, roles: MdRole[], user: MdUser) => {
  const privilegeDisplayUserRoles: PrivilegeUserRoleOrProfileModel[] = roles
    .map((pdur) => ({
      purpProfileOrRoleId: pdur.rRoleId as string,
      purpUserEntityId: user.uEntityId,
      purpPrivilegeType: "role",
    }));
  await DoPrivilegeDisplayUserRoleOrProfile.insertMany(trx, privilegeDisplayUserRoles);
};

const srUpdatePrivilegesDomains = async (trx: Transaction, domains: MdDomainDetails[], user: MdUser) => {
  const privilegeDisplayUserEntities: MdPrivilegeUserEntity[] = domains
    .map((pdue) => ({
      pueEntityId: pdue.dEntityId,
      pueUserEntityId: user.uEntityId,
      pueEntityType: "domain",
    }));
  await DoPrivilegeDisplayUserEntity.insertMany(trx, privilegeDisplayUserEntities);
};

const srUpdatePrivilegesGroups = async (trx: Transaction, groups: MdGroupDetails[], user: MdUser) => {
  const privilegeDisplayUserEntities: MdPrivilegeUserEntity[] = groups
    .map((pdue) => ({
      pueEntityId: pdue.gEntityId,
      pueUserEntityId: user.uEntityId,
      pueEntityType: "group",
    }));
  await DoPrivilegeDisplayUserEntity.insertMany(trx, privilegeDisplayUserEntities);
};

const srCreateUserRelationWithGroupsAssigned = async (trx: Transaction, groups: MdGroupDetails[], user: MdUser) => {
  const userGroupRelationPromises = groups.map(async (grp) => {
    const checkIfUserExistsInGroup = await DoEntityUser.findOneByPredicate(trx, {
      euUserEntityId: user.uEntityId,
      euEntityId: grp.gEntityId,
    });
    if (!checkIfUserExistsInGroup) {
      await DoEntityUser.insertOne(trx, {
        euEntityId: grp.gEntityId,
        euUserEntityId: user.uEntityId,
      });
    }
  });
  await Promise.all(userGroupRelationPromises);
};

const srGetUserDomainPrivileges = async (
  trx: Transaction, options: GetAllRolePermissionsType[], userEntityId: string,
): Promise<PrivilegeTypeOptions> => {
  const highPriorityOnesInDomain = UtPrivileges.findHighPriorityOnesPriv(options, "domain");
  const privilegeSchemaForDomain = await UtPrivileges.buildPrivilegeSchemaForDomain(
    trx, userEntityId, highPriorityOnesInDomain,
  );

  return {
    ...(privilegeSchemaForDomain || {}),
    permissions: highPriorityOnesInDomain || [],
  } as PrivilegeTypeOptions;
};

const srGetUserGroupPrivileges = async (
  trx: Transaction, options: GetAllRolePermissionsType[], userEntityId: string,
): Promise<PrivilegeTypeOptions> => {
  const highPriorityOnesInGroup = UtPrivileges.findHighPriorityOnesPrivForGroup(options, "group");
  const privilegeSchemaForGroup = await UtPrivileges.buildPrivilegeSchemaForGroup(
    trx, userEntityId, highPriorityOnesInGroup,
  );

  return {
    ...(privilegeSchemaForGroup || {}),
    permissions: highPriorityOnesInGroup || [],
  } as PrivilegeTypeOptions;
};

const srGetUserDomainUserPrivileges = async (
  trx: Transaction, options: GetAllRolePermissionsType[], userEntityId: string,
): Promise<PrivilegeTypeOptions> => {
  const highPriorityOnesInDomainUsers = UtPrivileges.findHighPriorityOnesPriv(options, "domain user");
  const privilegeSchemaForDomainUsers = await UtPrivileges.buildPrivilegeSchemaForDomain(
    trx, userEntityId, highPriorityOnesInDomainUsers,
  );

  return {
    ...(privilegeSchemaForDomainUsers || {}),
    permissions: highPriorityOnesInDomainUsers || [],
  } as PrivilegeTypeOptions;
};

const srGetUserGroupUserPrivileges = async (
  trx: Transaction, options: GetAllRolePermissionsType[], userEntityId: string,
): Promise<PrivilegeTypeOptions> => {
  const highPriorityOnesInGroupUser = UtPrivileges.findHighPriorityOnesPrivForGroup(options, "group user");
  const privilegeSchemaForGroupUser = await UtPrivileges.buildPrivilegeSchemaForGroup(
    trx, userEntityId, highPriorityOnesInGroupUser,
  );

  return {
    ...(privilegeSchemaForGroupUser || {}),
    permissions: highPriorityOnesInGroupUser || [],
  } as PrivilegeTypeOptions;
};

const srGetUserCampaignPrivileges = async (
  trx: Transaction, options: GetAllRolePermissionsType[], userEntityId: string,
): Promise<PrivilegeTypeOptions> => {
  const highPriorityOnesInCampaign = UtPrivileges.findHighPriorityOnesPrivForGroup(options, "campaign");
  const privilegeSchemaForCampaign = await UtPrivileges.buildPrivilegeSchemaForGroup(
    trx, userEntityId, highPriorityOnesInCampaign,
  );

  return {
    ...(privilegeSchemaForCampaign || {}),
    permissions: highPriorityOnesInCampaign || [],
  } as PrivilegeTypeOptions;
};

const srGetUserHitAllApiPrivileges = async (
  trx: Transaction, options: GetAllRolePermissionsType[], userEntityId: string,
): Promise<PrivilegeTypeOptions> => {
  const highPriorityOnesInHitAllApi = UtPrivileges.findHighPriorityOnesPrivForGroup(options, "hit all API");
  const privilegeSchemaForHitAllApi = await UtPrivileges.buildPrivilegeSchemaForGroup(
    trx, userEntityId, highPriorityOnesInHitAllApi,
  );

  return {
    ...(privilegeSchemaForHitAllApi || {}),
    permissions: highPriorityOnesInHitAllApi || [],
  } as PrivilegeTypeOptions;
};

class SrPrivileges {
  private static async updateUserPrivilegesInSession(trx: Transaction, user: MdUser): Promise<void> {
    const userEntityId = user?.uEntityId;
    if (userEntityId) {
      const newPrivilegesData = await SrPrivileges.getUserAllPrivileges(trx, userEntityId);
      await utUpdateUserPrivilegesInSession(userEntityId, (oldData = {} as {
        user: UserSessionType
      }) => ({
        ...oldData,
        user: {
          ...(oldData.user || {}),
          privileges: newPrivilegesData,
        },
      }));
    }
  }

  static async getUserAllPrivileges(
    trx: Transaction, userEntityId: string,
  ): Promise<PrivilegeTypeV1["privileges"]> {
    const userProfiles = await DoPrivilegeDisplayUserRoleOrProfile.findAllByPredicate(trx, {
      purpUserEntityId: userEntityId,
      purpPrivilegeType: "profile",
    });

    const userRoles = await DoPrivilegeDisplayUserRoleOrProfile.findAllByPredicate(trx, {
      purpUserEntityId: userEntityId,
      purpPrivilegeType: "role",
    });

    const userProfileRoles = userProfiles?.length
      ? await DoProfileRole.getProfileRolesIn(trx, userProfiles.map((up) => up.purpProfileOrRoleId))
      : [];

    const allRolesId = [
      ...userRoles.map((ur) => ur.purpProfileOrRoleId),
      ...userProfileRoles.map((upr) => upr.rRoleId as string),
    ];

    const rolePermissionOptions = await DoRolePermission.getAllRolePermissionsDetailsByRoles(trx, allRolesId);
    const permissions = rolePermissionOptions.map((p) => p.pPrivilege);

    const privileges = {
      permissions,
      domain: await srGetUserDomainPrivileges(trx, rolePermissionOptions, userEntityId),
      group: await srGetUserGroupPrivileges(trx, rolePermissionOptions, userEntityId),
      domainUser: await srGetUserDomainUserPrivileges(trx, rolePermissionOptions, userEntityId),
      groupUser: await srGetUserGroupUserPrivileges(trx, rolePermissionOptions, userEntityId),
      campaign: await srGetUserCampaignPrivileges(trx, rolePermissionOptions, userEntityId),
      hitAllApi: await srGetUserHitAllApiPrivileges(trx, rolePermissionOptions, userEntityId),
    };

    return privileges as PrivilegeTypeV1["privileges"];
  }

  static async saveAssignedPrivileges(trx: Transaction, data: ReqBodyUserPrivilegesType): Promise<void> {
    await DoPrivilegeDisplayUserRoleOrProfile.deleteManyByCol(trx, "purpUserEntityId", data.user.uEntityId as string);
    await DoPrivilegeDisplayUserEntity.deleteManyByCol(trx, "pueUserEntityId", data.user.uEntityId as string);

    if (data.profiles?.length) await srUpdateUserPrivilegesProfiles(trx, data.profiles, data.user);
    if (data.roles?.length) await srUpdatePrivilegesRoles(trx, data.roles, data.user);
    if (data.domains?.length) await srUpdatePrivilegesDomains(trx, data.domains, data.user);
    if (data.groups?.length) {
      await srUpdatePrivilegesGroups(trx, data.groups, data.user);
      await srCreateUserRelationWithGroupsAssigned(trx, data.groups, data.user);
    }
    await SrPrivileges.updateUserPrivilegesInSession(trx, data.user);
  }

  static getAllUsersAllPrivileges(
    trx: Transaction, allDetails?: boolean,
  ): QueryBuilder<AllUsersAllPrivilegesType[]> {
    if (allDetails) {
      return DoPrivileges.getAllUsersAllPrivilegesWithOptions(trx);
    }
    return DoPrivileges.getAllUsersAllPrivileges(trx);
  }
}

export default SrPrivileges;
