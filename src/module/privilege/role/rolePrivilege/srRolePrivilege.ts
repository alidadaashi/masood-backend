import { Transaction } from "knex";
import { ReqBodyRolePermissionsType } from "../../../shared/types/tpShared";
import DoRolePermission from "./doRolePrivilege";
import DoRole from "../doRole";
import MdUnprocessableEntityError from "../../../../base/errors/mdUnprocessableEntityError";
import DoPermission from "../../permission/doPrivilege";
import MdPrivilegeOptionSelected from "../../permission/privilegeOptionSelected/mdPrivilegeOptionSelected";
import DoPermissionOptionsSelected from "../../permission/privilegeOptionSelected/doPrivilegeOptionSelected";
import MdRole from "../mdRole";
import { utSanitizeText } from "../../../shared/utils/utString";
import { ERR_ROLE_NOT_EXISTS, ERR_ROLE_PERMISSION_REQUIRED, MESSAGE_INVALID_DATA } from "../../../shared/constants/dtOtherConstants";
import DoPrivilegeDisplayUserRoleOrProfile
  from "../../privilegeDisplayUserRoleOrProfile/doPrivilegeDisplayUserRoleOrProfile";
import { utUpdateAllUsersPrivilegesIn } from "../../../shared/utils/utSession";
import DoProfileRole from "../../profile/profileRole/doProfileRole";
import MdRolePrivilege from "./mdRolePrivilege";
import MdPrivilege from "../../permission/mdPrivilege";
import MdPrivilegeOption from "../../permission/privilegeOption/mdPrivilegeOption";

const srBuildPermissionOptions = async (
  trx: Transaction,
  rolePermissions: MdRolePrivilege[],
  p: MdPrivilege & { poPermissionOptions: MdPrivilegeOption[] },
) => {
  const roleP = rolePermissions.find((rp) => rp.rpPrivilegeId === p.pId);
  if (roleP) {
    const selectedOptionsDetails = await DoPermissionOptionsSelected
      .getOptionsDetailsByRolePermission(trx, roleP.rpId as string);

    return {
      ...p,
      pPermission: p.pPrivilege,
      itemSelected: true,
      edit: selectedOptionsDetails.find((spd) => spd.poOptionType === "e"),
      delete: selectedOptionsDetails.find((spd) => spd.poOptionType === "d"),
      view: selectedOptionsDetails.find((spd) => spd.poOptionType === "v"),
      create: selectedOptionsDetails.find((spd) => spd.poOptionType === "c"),
      function: selectedOptionsDetails.find((spd) => spd.poOptionType === "f"),
    } as ReqBodyRolePermissionsType["permissions"][number];
  }
  return p as unknown;
};

const srSaveRolePermissionsInDb = async (
  trx: Transaction,
  role: MdRole,
  permission: ReqBodyRolePermissionsType["permissions"][number],
) => {
  const [rolePermission] = await DoRolePermission.insertOne(trx, {
    rpRoleId: role.rRoleId as string,
    rpPrivilegeId: permission.pId,
  });

  const permissionOptionsSelected: MdPrivilegeOptionSelected[] = [];

  const srPushRolePermission = (poId: string) => {
    permissionOptionsSelected.push({
      posRolePrivilegeId: rolePermission.rpId as string,
      posPrivilegeOptionId: poId,
    });
  };

  if (permission.edit) srPushRolePermission(permission.edit.poId as string);
  if (permission.view) srPushRolePermission(permission.view.poId as string);
  if (permission.delete) srPushRolePermission(permission.delete.poId as string);
  if (permission.create) srPushRolePermission(permission.create.poId as string);
  if (permission.function) srPushRolePermission(permission.function.poId as string);

  await DoPermissionOptionsSelected.insertMany(trx, permissionOptionsSelected);
};

const srDeleteAllOldSelectedPermissionOptions = async (
  trx: Transaction,
  role: MdRole,
) => {
  const rolePermissions = await DoRolePermission.findAllByCol(trx, "rpRoleId", role.rRoleId as string);

  if (rolePermissions?.length) {
    await DoPermissionOptionsSelected.deleteManyByColWhereIn(trx, "posRolePrivilegeId",
      rolePermissions.map((rp) => rp.rpId as string));
  }

  await DoRolePermission.deleteManyByCol(trx, "rpRoleId", role.rRoleId as string);
};

const srUpdateUserPrivileges = async (
  trx: Transaction,
  roleId: string,
  data: ReqBodyRolePermissionsType,
) => {
  const rolesOrProfilesAttachedEntityIds = [];

  const rolesAttachedUserEntityIds = await DoPrivilegeDisplayUserRoleOrProfile.findAllByPredicatePickField(
    trx, {
      purpProfileOrRoleId: roleId,
      purpPrivilegeType: "role",
    }, "purpUserEntityId",
  );
  if (rolesAttachedUserEntityIds?.length) rolesOrProfilesAttachedEntityIds.push(...rolesAttachedUserEntityIds);

  const roleProfiles = await DoProfileRole.findAllByPredicatePickField(trx, {
    prRoleId: data.rId,
  }, "prProfileId");
  if (roleProfiles?.length) {
    const userEntityIds: string[] = await DoPrivilegeDisplayUserRoleOrProfile.findAllWhereColInPick(
      trx, "purpProfileOrRoleId", roleProfiles, "purpUserEntityId",
    );
    if (userEntityIds?.length) rolesOrProfilesAttachedEntityIds.push(...userEntityIds);
  }

  if (rolesOrProfilesAttachedEntityIds?.length) {
    await utUpdateAllUsersPrivilegesIn(trx, rolesOrProfilesAttachedEntityIds);
  }
};

class SrRolePrivilege {
  static async saveRolePermissions(
    trx: Transaction, data: ReqBodyRolePermissionsType, isUpdate = false,
  ): Promise<MdRole> {
    if (!(data.permissions && data.permissions.length)) {
      throw new MdUnprocessableEntityError(ERR_ROLE_PERMISSION_REQUIRED);
    }

    const roleData: Partial<MdRole> = { rRoleName: utSanitizeText(data.rRoleName) };
    if (data.rId) roleData.rRoleId = data.rId;

    const [role] = isUpdate
      ? await DoRole.updateOneByColName(trx, roleData, "rRoleId", roleData.rRoleId as string)
      : await DoRole.insertOne(trx, roleData);

    const selectedPermissions = data
      .permissions
      .filter((permission) => permission.itemSelected);

    if (!selectedPermissions.length) {
      throw new MdUnprocessableEntityError(ERR_ROLE_PERMISSION_REQUIRED);
    }

    await Promise.all(selectedPermissions.map(async (permission) => srSaveRolePermissionsInDb(trx, role, permission)));

    return role;
  }

  static async addRolePermissions(trx: Transaction, data: ReqBodyRolePermissionsType): Promise<MdRole> {
    if (data && !utSanitizeText(data.rRoleName)) {
      throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
    }
    return this.saveRolePermissions(trx, data);
  }

  static async updateRolePermissionsByRole(
    trx: Transaction, roleId: string, data: ReqBodyRolePermissionsType,
  ): Promise<MdRole> {
    if (data && !utSanitizeText(data.rRoleName)) throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);

    const role = await DoRole.findOneByCol(trx, "rRoleId", roleId);

    if (!role) throw new MdUnprocessableEntityError(ERR_ROLE_NOT_EXISTS);

    if (data && utSanitizeText(data.rRoleName) && !data.permissions?.length) {
      const [updatedRole] = await DoRole.updateOneByColName(trx,
        { rRoleName: utSanitizeText(data.rRoleName) }, "rRoleId", roleId);
      return updatedRole;
    }

    await srDeleteAllOldSelectedPermissionOptions(trx, role);

    const updateRolesPermissions = await this.saveRolePermissions(trx, {
      ...(data || {}),
      rId: roleId,
    }, true);

    await srUpdateUserPrivileges(trx, roleId, data);

    return updateRolesPermissions;
  }

  static async getRolePermissionsByRole(trx: Transaction, roleId: string): Promise<Record<string, undefined>[][]> {
    const role = await DoRole.findOneByPredicate(trx, {
      rRoleId: roleId,
      rRoleStatus: "active",
    });

    if (role) {
      const rolePermissions = await DoRolePermission.findAllByPredicate(trx, {
        rpRoleId: roleId,
      });
      if (rolePermissions.length) {
        const moduleIds = await DoPermission.getAllUniqueModuleIdsByRolePermissions(
          trx, rolePermissions.map((rp) => rp.rpPrivilegeId),
        );
        return Promise.all(
          moduleIds.map(async (mId) => {
            const permissions = await DoPermission.getAllPermissionsByModule(trx, mId);
            return Promise.all(permissions.map(
              (p) => srBuildPermissionOptions(trx, rolePermissions, p),
            ));
          }),
        ) as Promise<Record<string, undefined>[][]>;
      }

      return [];
    }
    throw new MdUnprocessableEntityError(ERR_ROLE_NOT_EXISTS);
  }
}

export default SrRolePrivilege;
