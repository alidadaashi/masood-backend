import {
  P_OPTION_ALL_IN_DOMAIN, P_OPTION_ALL_IN_SYSTEM, PERMISSIONS,
} from "../constants/dtPermissionConstants";
import MdPrivilegeOption from "../../privilege/permission/privilegeOption/mdPrivilegeOption";
import MdPrivilege from "../../privilege/permission/mdPrivilege";
import MdModule from "../../privilege/module/mdModule";
import { GroupRequestBodyType, UserReqType } from "../types/tpShared";
import MdDomainDetails from "../../entities/domain/mdDomainDetails";
import DummyPrivData, {
  ADMIN_MODULE_ID,
  CAMPAIGN_MODULE_ID,
  HIT_ALL_API_MODULE_ID,
  DOMAIN_MODULE_ID,
  DOMAIN_USER_MODULE_ID,
  DummyPrivOptionData,
  GROUP_MODULE_ID,
  GROUP_USER_MODULE_ID,
  ITG_ADMIN_USER_ID,
} from "../constants/dtPrivilegeIdsConstants";

export const dummyModules: MdModule[] = [
  {
    mModuleId: DOMAIN_MODULE_ID, mModuleName: "Domain", mModuleParentId: null, mModuleType: "privilege",
  },
  {
    mModuleId: GROUP_MODULE_ID, mModuleName: "Group", mModuleParentId: DOMAIN_MODULE_ID, mModuleType: "privilege",
  },
  {
    mModuleId: ADMIN_MODULE_ID,
    mModuleName: "Admin",
    mModuleParentId: null,
    mModuleStatus: "inactive",
    mModuleType: "privilege",
  },
  {
    mModuleId: DOMAIN_USER_MODULE_ID,
    mModuleName: "Domain User",
    mModuleParentId: DOMAIN_MODULE_ID,
    mModuleType: "privilege",
  },
  {
    mModuleId: GROUP_USER_MODULE_ID,
    mModuleName: "Group User",
    mModuleParentId: GROUP_MODULE_ID,
    mModuleType: "privilege",
  },
  {
    mModuleId: CAMPAIGN_MODULE_ID,
    mModuleName: "Campaign",
    mModuleParentId: GROUP_MODULE_ID,
    mModuleType: "privilege",
  },
  {
    mModuleId: HIT_ALL_API_MODULE_ID,
    mModuleName: "Hit All API",
    mModuleParentId: GROUP_MODULE_ID,
    mModuleType: "privilege",
  },
];

export const dummyModulePermissions: MdPrivilege[] = [
  {
    pId: DummyPrivData.DOMAIN_ID,
    pModuleId: DOMAIN_MODULE_ID,
    pPrivilege: PERMISSIONS.DOMAIN,
  },
  {
    pId: DummyPrivData.GROUP_ID,
    pModuleId: GROUP_MODULE_ID,
    pPrivilege: PERMISSIONS.GROUP,
  },
  {
    pId: DummyPrivData.DOMAIN_USER_ID,
    pModuleId: DOMAIN_USER_MODULE_ID,
    pPrivilege: PERMISSIONS.DOMAIN_USER,
  },
  {
    pId: DummyPrivData.GROUP_USER_ID,
    pModuleId: GROUP_USER_MODULE_ID,
    pPrivilege: PERMISSIONS.GROUP_USER,
  },
  {
    pId: DummyPrivData.CAMPAIGN_ID,
    pModuleId: CAMPAIGN_MODULE_ID,
    pPrivilege: PERMISSIONS.CAMPAIGN,
  },
  {
    pId: DummyPrivData.CMP_API_ID,
    pModuleId: HIT_ALL_API_MODULE_ID,
    pPrivilege: PERMISSIONS.CAMPAIGN_HIT_API,
  },
  {
    pId: DummyPrivData.DO_ALL,
    pModuleId: ADMIN_MODULE_ID,
    pPrivilege: PERMISSIONS.DO_ALL,
  },
];

export const domainAdminRolePermissions = [
  {
    pId: DummyPrivData.DOMAIN_ID,
    pPrivilege: "domain",
    itemSelected: true,
    edit: {
      poId: DummyPrivOptionData.D_EDIT_ALL_ID,
      poOption: P_OPTION_ALL_IN_SYSTEM,
      poOptionType: "e",
    } as MdPrivilegeOption,
    view: {
      poId: DummyPrivOptionData.D_VIEW_ALL_ID,
      poOption: P_OPTION_ALL_IN_SYSTEM,
      poOptionType: "v",
    } as MdPrivilegeOption,
    delete: {
      poId: DummyPrivOptionData.D_DELETE_ALL_ID,
      poOption: P_OPTION_ALL_IN_SYSTEM,
      poOptionType: "d",
    } as MdPrivilegeOption,
    create: {
      poId: DummyPrivOptionData.D_CREATE_ALL_ID,
      poOption: P_OPTION_ALL_IN_SYSTEM,
      poOptionType: "c",
    } as MdPrivilegeOption,
  },
];

export const groupAdminRolePermissions = [
  {
    pId: DummyPrivData.GROUP_ID,
    pPrivilege: "group",
    itemSelected: true,
    edit: {
      poId: DummyPrivOptionData.G_EDIT_ALL_ID,
      poOption: P_OPTION_ALL_IN_DOMAIN,
      poOptionType: "e",
    } as MdPrivilegeOption,
    view: {
      poId: DummyPrivOptionData.G_VIEW_ALL_ID,
      poOption: P_OPTION_ALL_IN_DOMAIN,
      poOptionType: "v",
    } as MdPrivilegeOption,
    delete: {
      poId: DummyPrivOptionData.G_DELETE_ALL_ID,
      poOption: P_OPTION_ALL_IN_DOMAIN,
      poOptionType: "d",
    } as MdPrivilegeOption,
    create: {
      poId: DummyPrivOptionData.G_CREATE_ALL_ID,
      poOption: P_OPTION_ALL_IN_DOMAIN,
      poOptionType: "c",
    } as MdPrivilegeOption,
  },
];

export const itgAdminRolePermissions = [
  {
    pId: DummyPrivData.DO_ALL,
    pPrivilege: PERMISSIONS.DO_ALL,
    itemSelected: true,
  },
];

export const itgAdminUserData = {
  uId: ITG_ADMIN_USER_ID,
  cEmail: "admin@admin.admin",
  cPassword: "123456",
  uFirstName: "ITG Admin User",
  uLastName: "ITG Admin User",
  uTitle: "ITG Admin Title",
} as UserReqType;

export const domainAdminUserData = {
  cEmail: "domain@domain.domain",
  cPassword: "123456",
  dName: "Domain",
  uFirstName: "Domain Admin User",
  uLastName: "Domain Admin User",
} as MdDomainDetails & UserReqType;

export const groupAdminUserData = {
  cEmail: "group@group.group",
  cPassword: "123456",
  gName: "Group",
  uFirstName: "Group Admin User",
  uLastName: "Group Admin User",
  uTitle: "Group",
} as unknown as GroupRequestBodyType;
