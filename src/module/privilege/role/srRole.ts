import { Transaction } from "knex";
import DoRole from "./doRole";
import DoPrivilegeDisplayUserRoleOrProfile from "../privilegeDisplayUserRoleOrProfile/doPrivilegeDisplayUserRoleOrProfile";
import { utUpdateAllUsersPrivilegesIn } from "../../shared/utils/utSession";
import DoProfileRole from "../profile/profileRole/doProfileRole";

const srUpdateUsersPrivileges = async (trx: Transaction, updatingUserEntityIds: string[]) => {
  const uniqueUserEntityIds = Array.from(new Set(updatingUserEntityIds));
  await utUpdateAllUsersPrivilegesIn(trx, uniqueUserEntityIds);
};

const srDeleteRoleFromAllProfiles = async (trx: Transaction, roleId: string) => {
  await DoProfileRole.deleteManyByCol(trx, "prRoleId", roleId);
};

const srDeleteRolesFromAllProfilesAndUpdatePrivileges = async (
  trx: Transaction,
  roleId: string,
  updatingUserEntityIds: string[],
) => {
  const roleProfileIds = await DoProfileRole.findAllByPredicatePickField(trx, {
    prRoleId: roleId,
  }, "prProfileId");

  if (roleProfileIds?.length) {
    await srDeleteRoleFromAllProfiles(trx, roleId);
    const profileAttachedUserEntityIds = await DoPrivilegeDisplayUserRoleOrProfile.findAllWhereColInPick(
      trx, "purpProfileOrRoleId", roleProfileIds, "purpUserEntityId",
    );

    updatingUserEntityIds.push(...profileAttachedUserEntityIds);
  }

  if (updatingUserEntityIds?.length) await srUpdateUsersPrivileges(trx, updatingUserEntityIds);
};

class SrRole {
  static async deleteByRole(trx: Transaction, rRoleId: string): Promise<void> {
    await DoRole.updateOneByPredicate(trx, {
      rRoleStatus: "disabled",
    }, {
      rRoleId,
    });

    const updatingUserEntityIds = [];

    const roleAttachedUserEntityIds = await DoPrivilegeDisplayUserRoleOrProfile.findAllByPredicatePickField(
      trx, {
        purpProfileOrRoleId: rRoleId,
        purpPrivilegeType: "role",
      }, "purpUserEntityId",
    );

    if (roleAttachedUserEntityIds?.length) {
      await DoPrivilegeDisplayUserRoleOrProfile.deleteManyByCol(trx, "purpProfileOrRoleId", rRoleId);
      updatingUserEntityIds.push(...roleAttachedUserEntityIds);
    }

    await srDeleteRolesFromAllProfilesAndUpdatePrivileges(trx, rRoleId, updatingUserEntityIds);
  }

  static async deleteRoles(trx: Transaction, deleteIds: string[]): Promise<void> {
    await Promise.all(
      deleteIds.map(async (id): Promise<void> => this.deleteByRole(trx, id)),
    );
  }
}

export default SrRole;
