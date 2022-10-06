import MdPrivilegeOption from "../../privilege/permission/privilegeOption/mdPrivilegeOption";
import {
  P_OPTION_ALL_IN_DOMAIN, P_OPTION_ALL_IN_GROUP, P_OPTION_NONE, P_OPTION_OWN_IN_DOMAIN, P_OPTION_YES,
}
  from "../constants/dtPermissionConstants";
import DummyPrivData, { DummyPrivOptionData } from "../constants/dtPrivilegeIdsConstants";

export const vendorAdminRolePermissions = [
  {
    pId: DummyPrivData.GROUP_ID,
    pPrivilege: "group",
    itemSelected: true,
    edit: { poId: DummyPrivOptionData.G_EDIT_YES_ID, poOption: P_OPTION_YES, poOptionType: "e" } as MdPrivilegeOption,
    view: { poId: DummyPrivOptionData.G_VIEW_YES_ID, poOption: P_OPTION_YES, poOptionType: "v" } as MdPrivilegeOption,
    delete: { poId: DummyPrivOptionData.G_DELETE_YES_ID, poOption: P_OPTION_YES, poOptionType: "d" } as MdPrivilegeOption,
    create: { poId: DummyPrivOptionData.G_CREATE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "c" } as MdPrivilegeOption,
  }, {
    pId: DummyPrivData.GROUP_USER_ID,
    pPrivilege: "group user",
    itemSelected: true,
    edit: { poId: DummyPrivOptionData.GU_EDIT_YES_ID, poOption: P_OPTION_YES, poOptionType: "e" } as MdPrivilegeOption,
    view: { poId: DummyPrivOptionData.GU_VIEW_YES_ID, poOption: P_OPTION_YES, poOptionType: "v" } as MdPrivilegeOption,
    delete: { poId: DummyPrivOptionData.GU_DELETE_YES_ID, poOption: P_OPTION_YES, poOptionType: "d" } as MdPrivilegeOption,
    create: {
      poId: DummyPrivOptionData.GU_CREATE_ALL_ID, poOption: P_OPTION_ALL_IN_DOMAIN, poOptionType: "c",
    } as MdPrivilegeOption,
  }, {
    pId: DummyPrivData.CAMPAIGN_ID,
    pPrivilege: "campaign",
    itemSelected: true,
    edit: {
      poId: DummyPrivOptionData.CMP_EDIT_ALL_ID, poOption: P_OPTION_ALL_IN_GROUP, poOptionType: "e",
    } as MdPrivilegeOption,
    view: {
      poId: DummyPrivOptionData.CMP_VIEW_ALL_ID, poOption: P_OPTION_ALL_IN_GROUP, poOptionType: "v",
    } as MdPrivilegeOption,
    delete: {
      poId: DummyPrivOptionData.CMP_DELETE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "d",
    } as MdPrivilegeOption,
  }, {
    pId: DummyPrivData.CMP_API_ID,
    pPrivilege: "hit all API",
    itemSelected: true,
    function: {
      poId: DummyPrivOptionData.CMP_HIT_API_ALL_ID, poOption: P_OPTION_ALL_IN_GROUP, poOptionType: "e",
    } as MdPrivilegeOption,
  },
];

export const supplierAdminRolePermissions = [
  {
    pId: DummyPrivData.GROUP_ID,
    pPrivilege: "group",
    itemSelected: true,
    edit: {
      poId: DummyPrivOptionData.G_EDIT_YES_ID, poOption: P_OPTION_YES, poOptionType: "e",
    } as MdPrivilegeOption,
    view: {
      poId: DummyPrivOptionData.G_VIEW_YES_ID, poOption: P_OPTION_YES, poOptionType: "v",
    } as MdPrivilegeOption,
    delete: {
      poId: DummyPrivOptionData.G_DELETE_YES_ID, poOption: P_OPTION_YES, poOptionType: "d",
    } as MdPrivilegeOption,
    create: {
      poId: DummyPrivOptionData.G_CREATE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "c",
    } as MdPrivilegeOption,
  }, {
    pId: DummyPrivData.GROUP_USER_ID,
    pPrivilege: "group user",
    itemSelected: true,
    edit: {
      poId: DummyPrivOptionData.GU_EDIT_YES_ID, poOption: P_OPTION_YES, poOptionType: "e",
    } as MdPrivilegeOption,
    view: {
      poId: DummyPrivOptionData.GU_VIEW_YES_ID, poOption: P_OPTION_YES, poOptionType: "v",
    } as MdPrivilegeOption,
    delete: {
      poId: DummyPrivOptionData.GU_DELETE_YES_ID, poOption: P_OPTION_YES, poOptionType: "d",
    } as MdPrivilegeOption,
    create: {
      poId: DummyPrivOptionData.GU_CREATE_ALL_ID, poOption: P_OPTION_ALL_IN_DOMAIN, poOptionType: "c",
    } as MdPrivilegeOption,
  }, {
    pId: DummyPrivData.CAMPAIGN_ID,
    pPrivilege: "campaign",
    itemSelected: true,
    edit: {
      poId: DummyPrivOptionData.CMP_EDIT_ALL_ID, poOption: P_OPTION_ALL_IN_GROUP, poOptionType: "e",
    } as MdPrivilegeOption,
    view: {
      poId: DummyPrivOptionData.CMP_VIEW_ALL_ID, poOption: P_OPTION_ALL_IN_GROUP, poOptionType: "v",
    } as MdPrivilegeOption,
    delete: {
      poId: DummyPrivOptionData.CMP_DELETE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "d",
    } as MdPrivilegeOption,
  },
];

export const privilegeClassesViewEditPermissions = [
  {
    pId: DummyPrivData.GROUP_USER_ID,
    pPrivilege: "group user",
    itemSelected: true,
    edit: {
      poId: DummyPrivOptionData.GU_EDIT_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "e",
    } as MdPrivilegeOption,
    view: {
      poId: DummyPrivOptionData.GU_VIEW_YES_ID, poOption: P_OPTION_YES, poOptionType: "v",
    } as MdPrivilegeOption,
    delete: {
      poId: DummyPrivOptionData.GU_DELETE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "d",
    } as MdPrivilegeOption,
    create: {
      poId: DummyPrivOptionData.GU_CREATE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "c",
    } as MdPrivilegeOption,
  },
];

export const groupCreatePermissions = [
  {
    pId: DummyPrivData.GROUP_ID,
    pPrivilege: "group",
    itemSelected: true,
    edit: {
      poId: DummyPrivOptionData.G_EDIT_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "e",
    } as MdPrivilegeOption,
    view: {
      poId: DummyPrivOptionData.G_VIEW_OWN_ID, poOption: P_OPTION_OWN_IN_DOMAIN, poOptionType: "v",
    } as MdPrivilegeOption,
    delete: {
      poId: DummyPrivOptionData.G_DELETE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "d",
    } as MdPrivilegeOption,
    create: {
      poId: DummyPrivOptionData.G_CREATE_ALL_ID, poOption: P_OPTION_ALL_IN_DOMAIN, poOptionType: "c",
    } as MdPrivilegeOption,
  },
];

export const groupViewPermissions = [
  {
    pId: DummyPrivData.GROUP_ID,
    pPrivilege: "group",
    itemSelected: true,
    edit: {
      poId: DummyPrivOptionData.G_EDIT_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "e",
    } as MdPrivilegeOption,
    view: {
      poId: DummyPrivOptionData.G_VIEW_YES_ID, poOption: P_OPTION_YES, poOptionType: "v",
    } as MdPrivilegeOption,
    delete: {
      poId: DummyPrivOptionData.G_DELETE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "d",
    } as MdPrivilegeOption,
    create: {
      poId: DummyPrivOptionData.G_CREATE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "c",
    } as MdPrivilegeOption,
  },
];

export const groupEditPermissions = [
  {
    pId: DummyPrivData.GROUP_ID,
    pPrivilege: "group",
    itemSelected: true,
    edit: {
      poId: DummyPrivOptionData.G_EDIT_YES_ID, poOption: P_OPTION_YES, poOptionType: "e",
    } as MdPrivilegeOption,
    view: {
      poId: DummyPrivOptionData.G_VIEW_YES_ID, poOption: P_OPTION_YES, poOptionType: "v",
    } as MdPrivilegeOption,
    delete: {
      poId: DummyPrivOptionData.G_DELETE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "d",
    } as MdPrivilegeOption,
    create: {
      poId: DummyPrivOptionData.G_CREATE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "c",
    } as MdPrivilegeOption,
  },
];

export const groupUserViewPermissions = [
  {
    pId: DummyPrivData.GROUP_USER_ID,
    pPrivilege: "group user",
    itemSelected: true,
    edit: {
      poId: DummyPrivOptionData.GU_EDIT_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "e",
    } as MdPrivilegeOption,
    view: {
      poId: DummyPrivOptionData.GU_VIEW_YES_ID, poOption: P_OPTION_YES, poOptionType: "v",
    } as MdPrivilegeOption,
    delete: {
      poId: DummyPrivOptionData.GU_DELETE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "d",
    } as MdPrivilegeOption,
    create: {
      poId: DummyPrivOptionData.GU_CREATE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "c",
    } as MdPrivilegeOption,
  },
];

export const groupUserEditPermissions = [
  {
    pId: DummyPrivData.GROUP_USER_ID,
    pPrivilege: "group user",
    itemSelected: true,
    edit: {
      poId: DummyPrivOptionData.GU_EDIT_YES_ID, poOption: P_OPTION_YES, poOptionType: "e",
    } as MdPrivilegeOption,
    view: {
      poId: DummyPrivOptionData.GU_VIEW_YES_ID, poOption: P_OPTION_YES, poOptionType: "v",
    } as MdPrivilegeOption,
    delete: {
      poId: DummyPrivOptionData.GU_DELETE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "d",
    } as MdPrivilegeOption,
    create: {
      poId: DummyPrivOptionData.GU_CREATE_NONE_ID, poOption: P_OPTION_NONE, poOptionType: "c",
    } as MdPrivilegeOption,
  },
];
