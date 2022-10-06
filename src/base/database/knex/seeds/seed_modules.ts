import Knex, { QueryBuilder, Transaction } from "knex";
import DoModule from "../../../../module/privilege/module/doModule";
import DoPermission from "../../../../module/privilege/permission/doPrivilege";
import {
  domainAdminRolePermissions,
  domainAdminUserData,
  dummyModulePermissions,
  dummyModules,
  groupAdminRolePermissions,
  groupAdminUserData,
  itgAdminRolePermissions,
  itgAdminUserData,
} from "../../../../module/shared/data/dtPrivilege";
import PermissionOptionsDao from "../../../../module/privilege/permission/privilegeOption/doPrivilegeOption";
import MdRole from "../../../../module/privilege/role/mdRole";
import SrRolePrivilege from "../../../../module/privilege/role/rolePrivilege/srRolePrivilege";
import SrUser from "../../../../module/user/srUser";
import SrDomainDetails from "../../../../module/entities/domain/srDomainDetails";
import SrGroupDetails from "../../../../module/entities/group/srGroupDetails";
import SrPrivileges from "../../../../module/privilege/srPrivileges";
import DoCredentials from "../../../../module/user/credentials/doCredential";
import MdUser from "../../../../module/user/mdUser";
import DoCreatorEntity from "../../../../module/entities/creatorEntity/doCreatorEntity";
import MdCredential from "../../../../module/user/credentials/mdCredential";
import MdDomainDetails from "../../../../module/entities/domain/mdDomainDetails";
import DoUser from "../../../../module/user/doUser";
import {
  DOMAIN_ADMIN_ROLE_ID, GROUP_ADMIN_ROLE_ID,
  GROUP_CREATE_ROLE_ID,
  GROUP_INFO_EDIT_ROLE_ID,
  GROUP_INFO_VIEW_ROLE_ID,
  ITG_ADMIN_ROLE_ID,
  ITG_ADMIN_USER_ID,
  PRIVILECLASSES_VIEW_EDIT_ROLE_ID,
  SUPPLIER_ADMIN_ROLE_ID,
  USER_INFO_EDIT_ROLE_ID,
  USER_INFO_VIEW_ROLE_ID,
  VENDOR_ADMIN_ROLE_ID,
} from "../../../../module/shared/constants/dtPrivilegeIdsConstants";
import { dummyOptionsAvailable } from "../../../../module/shared/data/dtPrivilegeOptions";
import DoUserSelectedInstance from "../../../../module/user/userSelectedInstance/doUserSelectedInstance";
import {
  vendorAdminRolePermissions, supplierAdminRolePermissions, privilegeClassesViewEditPermissions,
  groupCreatePermissions, groupViewPermissions, groupEditPermissions, groupUserEditPermissions,
  groupUserViewPermissions
} from "../../../../module/shared/data/dtMigrationPrivileges";
import { dtDummyEntities, dtDummyCompanies, dtDummyInstances } from "../../../../module/shared/data/dtEntities";
import doEntity from "../../../../module/entity/doEntity";
import doDomainDetails from "../../../../module/entities/domain/doDomainDetails";
import doGroupDetails from "../../../../module/entities/group/doGroupDetails";
import doCompanyDetails from "../../../../module/entities/company/doCompanyDetails";

const isAdminAlreadyExists = (trx: Transaction) => DoCredentials
  .findOneByCol(trx, "cEmail", "admin@admin.admin");

export const createDomainAdminRole = (
  trx: Transaction,
): Promise<MdRole> => SrRolePrivilege.saveRolePermissions(trx, {
  rId: DOMAIN_ADMIN_ROLE_ID,
  rRoleName: "Domain Admin",
  permissions: domainAdminRolePermissions,
});

export const createGroupAdminRole = (trx: Transaction, role: MdRole): Promise<MdRole> => SrRolePrivilege
  .saveRolePermissions(trx, {
    rId: role.rRoleId,
    rRoleName: role.rRoleName,
    permissions: groupAdminRolePermissions,
  });

export const createVendorAdminRole = (trx: Transaction): Promise<MdRole> => SrRolePrivilege
  .saveRolePermissions(trx, {
    rId: VENDOR_ADMIN_ROLE_ID,
    rRoleName: "Vendor Admin",
    permissions: vendorAdminRolePermissions,
  });

export const createSupplierAdminRole = (trx: Transaction): Promise<MdRole> => SrRolePrivilege
  .saveRolePermissions(trx, {
    rId: SUPPLIER_ADMIN_ROLE_ID,
    rRoleName: "Supplier Admin",
    permissions: supplierAdminRolePermissions,
  });

export const createPrivilegeClassesViewEditRole = (trx: Transaction): Promise<MdRole> => SrRolePrivilege
  .saveRolePermissions(trx, {
    rId: PRIVILECLASSES_VIEW_EDIT_ROLE_ID,
    rRoleName: "Privileges View/Edit",
    permissions: privilegeClassesViewEditPermissions,
  });

export const createSuppliersCreationRole = (trx: Transaction): Promise<MdRole> => SrRolePrivilege
  .saveRolePermissions(trx, {
    rId: GROUP_CREATE_ROLE_ID,
    rRoleName: "Supplier Creation",
    permissions: groupCreatePermissions,
  });

export const createSuppliersInfoViewRole = (trx: Transaction): Promise<MdRole> => SrRolePrivilege
  .saveRolePermissions(trx, {
    rId: GROUP_INFO_VIEW_ROLE_ID,
    rRoleName: "Supplier Info View",
    permissions: groupViewPermissions,
  });

export const createSuppliersInfoEditRole = (trx: Transaction): Promise<MdRole> => SrRolePrivilege
  .saveRolePermissions(trx, {
    rId: GROUP_INFO_EDIT_ROLE_ID,
    rRoleName: "Supplier Info Edit",
    permissions: groupEditPermissions,
  });

export const createUsersInfoViewRole = (trx: Transaction): Promise<MdRole> => SrRolePrivilege
  .saveRolePermissions(trx, {
    rId: USER_INFO_VIEW_ROLE_ID,
    rRoleName: "User Info View",
    permissions: groupUserViewPermissions,
  });

export const createUsersInfoEditRole = (trx: Transaction): Promise<MdRole> => SrRolePrivilege
  .saveRolePermissions(trx, {
    rId: USER_INFO_EDIT_ROLE_ID,
    rRoleName: "User Info Edit",
    permissions: groupUserEditPermissions,
  });

export const createItgAdminRole = (
  trx: Transaction,
): Promise<MdRole> => SrRolePrivilege.saveRolePermissions(trx, {
  rId: ITG_ADMIN_ROLE_ID,
  rRoleName: "ITG Admin",
  permissions: itgAdminRolePermissions,
});

const createItgAdmin = async (trx: Transaction): Promise<MdUser & MdCredential> => {
  const itgAdminUser = await SrUser.addUser(trx, itgAdminUserData);
  await DoUser.updateOneByColName(trx, { uId: ITG_ADMIN_USER_ID }, "uId", itgAdminUser.uId as string);
  const itgAdminRoleData = await createItgAdminRole(trx);
  await SrPrivileges.saveAssignedPrivileges(trx, {
    user: itgAdminUser,
    domains: [],
    groups: [],
    roles: [itgAdminRoleData],
    profiles: [],
  });

  return itgAdminUser;
};

const createDomainAdmin = async (
  trx: Transaction, creatorUser: MdUser & MdCredential,
): Promise<MdDomainDetails & MdUser> => {
  const domain = await SrDomainDetails.addDomain(trx, domainAdminUserData);
  await DoCreatorEntity.insertOne(trx, {
    ceCreatorId: creatorUser.uEntityId,
    ceEntityId: domain.dEntityId,
    ceEntityType: "domain",
  });
  const domainAdminRole = await createDomainAdminRole(trx);
  await SrPrivileges.saveAssignedPrivileges(trx, {
    user: {
      uId: domain.uId,
      uEntityId: domain.uEntityId,
    } as MdUser,
    domains: [],
    groups: [],
    roles: [domainAdminRole],
    profiles: [],
  });

  return domain;
};

const createGroupAdmin = async (trx: Transaction, domain: MdDomainDetails & MdUser) => {
  const group = await SrGroupDetails.addGroup(trx, {
    ...groupAdminUserData,
    domain,
  });
  const groupAdminRole = await createGroupAdminRole(trx,
    { rRoleId: GROUP_ADMIN_ROLE_ID, rRoleName: "Group Admin" });
  await DoUserSelectedInstance.insertOne(trx, {
    usiSelectedInstanceEntityId: group.gEntityId,
    usiUserEntityId: group.uEntityId,
  });
  await SrPrivileges.saveAssignedPrivileges(trx, {
    user: {
      uId: group.uId,
      uEntityId: group.uEntityId,
    } as MdUser,
    domains: [domain],
    groups: [],
    roles: [groupAdminRole],
    profiles: [],
  });
};

const createAdminUsers = async (trx: Transaction) => {
  if (!await isAdminAlreadyExists(trx)) {
    const itgAdminUser = await createItgAdmin(trx);
    const domainAdminUser = await createDomainAdmin(trx, itgAdminUser);
    await createGroupAdmin(trx, domainAdminUser);
  }
};

const createModulesWithPermissionsAndOptions = async (trx: Transaction) => {
  await DoModule.upsertMany(trx, dummyModules, ["mModuleId"]);
  await DoPermission.upsertMany(trx, dummyModulePermissions, ["pId"]);
  await PermissionOptionsDao.upsertMany(trx, dummyOptionsAvailable, ["poId"]);
};

const createMigrationRolesAndPrivileges = async (trx: Transaction) => {
  await createVendorAdminRole(trx);
  await createSupplierAdminRole(trx);
  await createPrivilegeClassesViewEditRole(trx);
  await createSuppliersCreationRole(trx);
  await createSuppliersInfoViewRole(trx);
  await createSuppliersInfoEditRole(trx);
  await createUsersInfoEditRole(trx);
  await createUsersInfoViewRole(trx);
};

const createTestCompanies = async (trx: Transaction) => {
  await doEntity.insertMany(trx, dtDummyEntities);
  const domain = (await doDomainDetails.getAll(trx))[0]
  if (domain) {
    const dummyInst = await doGroupDetails.insertMany(trx, dtDummyInstances(domain.dEntityId))
    await doCompanyDetails.insertMany(trx, [
      dtDummyCompanies(dummyInst[0].gEntityId)[0], dtDummyCompanies(dummyInst[0].gEntityId)[1],
      dtDummyCompanies(dummyInst[1].gEntityId)[2], dtDummyCompanies(dummyInst[1].gEntityId)[3]
    ])
  }
}

export const seed = async function seed(knex: Knex): Promise<QueryBuilder> {
  return knex.transaction(async (trx) => {
    await createModulesWithPermissionsAndOptions(trx);
    await createAdminUsers(trx);
    await createMigrationRolesAndPrivileges(trx);
    await createTestCompanies(trx)
  });
};
