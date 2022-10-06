import { Transaction } from "knex";
import DoEntity from "../../../module/entity/doEntity";
import DoGroupDetails from "../../../module/entities/group/doGroupDetails";
import MdDomainDetails from "../../../module/entities/domain/mdDomainDetails";
import { EntityTypes, UserPreferencesType } from "../../../module/shared/types/tpShared";
import MdGroupDetails from "../../../module/entities/group/mdGroupDetails";
import DoEntityUser from "../../../module/entity/entityUser/doEntityUser";
import DoCredentials from "../../../module/user/credentials/doCredential";
import DoUser from "../../../module/user/doUser";
import Bcrypt from "../../../module/shared/services/srBcrypt";
import MdEntityUser from "../../../module/entity/entityUser/mdEntityUser";
import MdUser from "../../../module/user/mdUser";
import MdCredential from "../../../module/user/credentials/mdCredential";
import SrUserPreferences from "../../../module/preferences/userPreference/srUserPreferences";
import { LANGUAGE_TR, LANGUAGE_EN } from "../../../module/shared/data/dtI18nLanguages";
import {
  tpOldDbSuserPrivs, tpOldDbVendorSettings, tpOldDbVuserPrivs, tpUserMigrationData,
} from "../tpOldDb";
import { defaultUserPreferences } from "../../../module/shared/data/dtUserPreferences";
import DoRole from "../../../module/privilege/role/doRole";
import DoUserSelectedInstance from "../../../module/user/userSelectedInstance/doUserSelectedInstance";
import SrPrivileges from "../../../module/privilege/srPrivileges";
import {
  GROUP_CREATE_ROLE_ID, GROUP_INFO_EDIT_ROLE_ID, GROUP_INFO_VIEW_ROLE_ID,
  PRIVILECLASSES_VIEW_EDIT_ROLE_ID, SUPPLIER_ADMIN_ROLE_ID, USER_INFO_EDIT_ROLE_ID,
  USER_INFO_VIEW_ROLE_ID, VENDOR_ADMIN_ROLE_ID,
} from "../../../module/shared/constants/dtPrivilegeIdsConstants";
import DoDomain from "../../../module/entities/domain/doDomainDetails";
import { tpMigrationData } from "../services/srMigration";
import MdRole from "../../../module/privilege/role/mdRole";

export const utAddDummyDomain = async (
  trx: Transaction,
): Promise<MdDomainDetails> => {
  const [{ entityId }] = await DoEntity.insertOne(trx, { entityType: "domain" });
  const [domain] = await DoDomain.insertOne(trx, {
    dId: "5c802272-e57e-11ec-8fea-0242ac120002",
    dEntityId: entityId,
    dName: "Supplier Domain",
  });
  return domain;
};

const utAssignUserPrivileges = async (
  trx: Transaction,
  { domain, group }: { domain: MdDomainDetails, group: MdGroupDetails },
  { user, roles }: { user: MdUser, roles: MdRole[] },
) => {
  const userSelectedInstance = await DoUserSelectedInstance.findOneByCol(trx, "usiUserEntityId", user.uEntityId);
  if (!userSelectedInstance) {
    await DoUserSelectedInstance.insertOne(trx, {
      usiSelectedInstanceEntityId: group.gEntityId,
      usiUserEntityId: user.uEntityId,
    });
    await SrPrivileges.saveAssignedPrivileges(trx, {
      user: {
        uId: user.uId,
        uEntityId: user.uEntityId,
      } as MdUser,
      domains: [domain],
      groups: [group],
      roles,
      profiles: [],
    });
  }
};

const utMapVendorPrivilegesToNewDbRoleIds = (
  vendorPrivileges: tpOldDbVuserPrivs,
): string[] => {
  const roles = [] as string[];
  vendorPrivileges.forEach((priv) => {
    if (priv.vpriv_privilege === "ADMIN_CREATE_SUPPLIER") roles.push(GROUP_CREATE_ROLE_ID);
    if (priv.vpriv_privilege === "ADMIN_SUPPINFO_EDIT") roles.push(GROUP_INFO_EDIT_ROLE_ID);
    if (priv.vpriv_privilege === "ADMIN_SUPPINFO_VIEW") roles.push(GROUP_INFO_VIEW_ROLE_ID);
    if (priv.vpriv_privilege === "ADMIN_PRIVILECLASSES_VIEW_EDIT") roles.push(PRIVILECLASSES_VIEW_EDIT_ROLE_ID);
    if (priv.vpriv_privilege === "ADMIN_USERINFO_EDIT") roles.push(USER_INFO_EDIT_ROLE_ID);
    if (priv.vpriv_privilege === "ADMIN_USERINFO_VIEW") roles.push(USER_INFO_VIEW_ROLE_ID);
  });
  return roles;
};

const utGetVendorPrivilegesMappedToNewDbRoles = async (
  trx: Transaction,
  vendorPrivileges: tpOldDbVuserPrivs,
): Promise<MdRole[]> => {
  const mappedRoleIds = utMapVendorPrivilegesToNewDbRoleIds(vendorPrivileges);
  const roles = [] as MdRole[];
  mappedRoleIds.map(async (roleId) => {
    roles.push(await DoRole.findOneByCol(trx, "rRoleId", roleId));
  });
  return roles;
};

const utGetSuppPrivilegesMappedToNewDbRoles = async (
  trx: Transaction,
  supplierPrivileges: tpOldDbSuserPrivs,
): Promise<MdRole[]> => {
  const roles = [] as MdRole[];
  supplierPrivileges.map(async (priv) => {
    if (priv.spriv_privilege === "ADMIN_PRIVILECLASSES_VIEW_EDIT") {
      roles.push(await DoRole.findOneByCol(trx, "rRoleId", PRIVILECLASSES_VIEW_EDIT_ROLE_ID));
    }
    if (priv.spriv_privilege === "ADMIN_USERINFO_EDIT") {
      roles.push(await DoRole.findOneByCol(trx, "rRoleId", USER_INFO_EDIT_ROLE_ID));
    }
    if (priv.spriv_privilege === "ADMIN_USERINFO_VIEW") {
      roles.push(await DoRole.findOneByCol(trx, "rRoleId", USER_INFO_VIEW_ROLE_ID));
    }
  });
  return roles;
};

const utAssignVendorPrivileges = async (
  trx: Transaction,
  { domain, group }: { domain: MdDomainDetails, group: MdGroupDetails },
  userData: tpUserMigrationData,
  user: MdUser,
) => {
  const { vuserPrivilege, vendorPrivileges } = userData;
  if (vuserPrivilege === -1) {
    const vendorAdminRole = await DoRole.findOneByCol(trx, "rRoleId", VENDOR_ADMIN_ROLE_ID);
    const roles = [vendorAdminRole];
    await utAssignUserPrivileges(trx, { domain, group }, { user, roles });
  } else if (vuserPrivilege === 1 && vendorPrivileges) {
    const roles = await utGetVendorPrivilegesMappedToNewDbRoles(trx, vendorPrivileges);
    await utAssignUserPrivileges(trx, { domain, group }, { user, roles });
  }
};

const utAssignSupplierPrivileges = async (
  trx: Transaction,
  { domain, group }: { domain: MdDomainDetails, group: MdGroupDetails },
  userData: tpUserMigrationData,
  user: MdUser,
) => {
  const { suserPrivilege, supplierPrivileges } = userData;
  if (suserPrivilege === -1) {
    const supplierAdminRole = await DoRole.findOneByCol(trx, "rRoleId", SUPPLIER_ADMIN_ROLE_ID);
    const roles = [supplierAdminRole];
    await utAssignUserPrivileges(trx, { domain, group }, { user, roles });
  } else if (suserPrivilege === 1 && supplierPrivileges) {
    const roles = await utGetSuppPrivilegesMappedToNewDbRoles(trx, supplierPrivileges);
    await utAssignUserPrivileges(trx, { domain, group }, { user, roles });
  }
};

export const utAddMigrationGroup = async (
  trx: Transaction,
  domain: MdDomainDetails,
  data: {
    groupName: string,
    entityType: EntityTypes,
    refId?: string,
    creationDate: string | null,
    originalType: "vendor" | "supplier"
  },
): Promise<MdGroupDetails> => {
  const {
    groupName, entityType, refId, creationDate,
  } = data;
  const [insertedGroup] = await DoEntity.insertOne(trx, {
    entityType,
    entityStatus: "active",
  });
  const [groupDetails] = await DoGroupDetails.insertOne(trx, {
    gDomainEntityId: domain.dEntityId,
    gEntityId: insertedGroup.entityId,
    gName: groupName,
    refSpId: refId,
    gCreatedAt: creationDate,
  });
  return groupDetails;
};

export const utFormatPreferences = (
  vendorSettings: tpOldDbVendorSettings,
  userData: tpUserMigrationData,
): UserPreferencesType => {
  const userPreferences = {
    dateInputFormat: userData.dateFormat === "DDMMYYYY" ? "dd/MM/yyyy" : "MM/dd/yyyy",
    dateDisplayFormat: userData.dateFormat === "DDMMYYYY" ? "DD/MM/YYYY" : "MM/DD/YYYY",
    defaultDtPageSize: userData.linesPerPage || defaultUserPreferences.defaultDtPageSize,
    timeZoneValue: defaultUserPreferences.timeZoneValue,
    language: userData.language === "tr" ? LANGUAGE_TR : LANGUAGE_EN,
    numFmt: vendorSettings.numberFormat === "y" ? ",sep.decimal" : ".sep,decimal",
    qtyDecRng: vendorSettings.quantityScale || defaultUserPreferences.qtyDecRng,
    uPrcDecRng: vendorSettings.priceScale || defaultUserPreferences.uPrcDecRng,
    pctDecRng: vendorSettings.percentageScale || defaultUserPreferences.pctDecRng,
  };
  return userPreferences as UserPreferencesType;
};

export const utInsertUserToNewDb = async (
  trx: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  userData: tpUserMigrationData,
  formattedEmail: string,
): Promise<void> => {
  const userPreferences = utFormatPreferences(vendorSettings, userData);
  const [{ entityId }] = await DoEntity.insertOne(trx, { entityType: "user" });
  const [user] = await DoUser.insertOne(trx, {
    uEntityId: entityId,
    uFirstName: userData.userName,
    uLastName: userData.userName,
  });
  await DoCredentials.insertOne(trx, {
    cEmail: formattedEmail,
    cUserEntityId: user.uEntityId,
    cPassword: await Bcrypt.bcryptHash(userData.password),
  });
  await DoEntityUser.insertOne(trx, {
    euEntityId: group.gEntityId, euUserEntityId: user.uEntityId, refId: userData.userId,
  });
  await SrUserPreferences.updateUserPreferences(trx, user.uEntityId, { payload: userPreferences });
  if (userData.vuserPrivilege) await utAssignVendorPrivileges(trx, { domain, group }, userData, user);
  if (userData.suserPrivilege) await utAssignSupplierPrivileges(trx, { domain, group }, userData, user);
};

export const utAddMigrationUser = async (
  trx: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  userData: tpUserMigrationData,
): Promise<void> => {
  const formattedEmail = `${userData.userId}-${userData.parentId}-${userData.userEmail}`;
  const isUserExistsAlready = await DoCredentials.findOneByCol(trx, "cEmail", formattedEmail);
  if (!isUserExistsAlready) {
    await utInsertUserToNewDb(trx, { domain, group, vendorSettings }, userData, formattedEmail);
  } else {
    await DoEntityUser.insertOne(trx, {
      euEntityId: group.gEntityId,
      euUserEntityId: isUserExistsAlready.cUserEntityId,
      refId: userData.userId,
    });
  }
};

const utUpdateUserPreferencesAndPrivs = async (
  trx: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  updatedData: tpUserMigrationData,
  user: MdUser,
) => {
  const userPreferences = utFormatPreferences(vendorSettings, updatedData);
  await SrUserPreferences.updateUserPreferences(trx, user.uEntityId, { payload: userPreferences });
  if (updatedData.vuserPrivilege) await utAssignVendorPrivileges(trx, { domain, group }, updatedData, user);
  if (updatedData.suserPrivilege) await utAssignSupplierPrivileges(trx, { domain, group }, updatedData, user);
};

export const utUpdateMigrationUser = async (
  trx: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  existingUser: MdEntityUser,
  updatedData: tpUserMigrationData,
): Promise<MdUser & MdCredential> => {
  const email = `${updatedData.userId}-${updatedData.parentId}-${updatedData.userEmail}`;
  const user = await DoUser.findOneByCol(trx, "uEntityId", existingUser.euUserEntityId);

  const [updatedUser] = await DoUser.updateOneByColName(trx, {
    uFirstName: updatedData.userName,
    uLastName: updatedData.userName,
  }, "uId", user.uId as string);

  const [updatedCredentials] = await DoCredentials.updateOneByColName(trx, {
    cEmail: email,
    ...(updatedData.password?.length ? { cPassword: await Bcrypt.bcryptHash(updatedData.password) } : null),
  }, "cUserEntityId", updatedUser.uEntityId);

  await utUpdateUserPreferencesAndPrivs(trx, { domain, group, vendorSettings }, updatedData, user);
  return { ...updatedUser, ...updatedCredentials };
};
