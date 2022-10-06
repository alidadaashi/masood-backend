import {
  EntityTypes, PermissionOptionTypes, PrivilegeTypeV1, tpUserInstances, UserSessionType,
} from "../module/shared/types/tpShared";
import { OPTIONS_SEPARATOR, P_OPTION_YES, PERMISSIONS } from "../module/shared/constants/dtPermissionConstants";
import { utCanViewAssigned } from "../module/shared/utils/utAuth";

export const utGetAllPermissionValues = (permissions: Record<PermissionOptionTypes, string>): string[] => {
  const permissionValues = Object
    .values(permissions)
    .reduce((accumPermissions: string[], pv: string): string[] => {
      if (pv) {
        if (pv.indexOf(OPTIONS_SEPARATOR)) {
          return [...accumPermissions, ...pv.split(OPTIONS_SEPARATOR)];
        }
        return [...accumPermissions, pv];
      }
      return accumPermissions;
    }, []);
  return permissionValues.length ? Array.from(new Set(permissionValues)) : [];
};

export const utGetPermissionKeyWhereTypeIs = (
  permissions: Record<PermissionOptionTypes, string>, optionType: string,
): string => Object
  .keys(permissions)
  .find((p) => {
    const pValue = permissions[p as PermissionOptionTypes];
    return pValue === optionType
      || (pValue.indexOf(OPTIONS_SEPARATOR) && pValue.split(OPTIONS_SEPARATOR)
        .includes(optionType));
  }) || "";

export const utGetAllIdsFromPermissionOfType = (
  permissions: PrivilegeTypeV1["privileges"]["group"],
  permissionKey: string,
  optionType: string,
): string[] => {
  if (permissions && permissionKey && typeof permissions[permissionKey as PermissionOptionTypes] === "object") {
    const permissionObj = permissions[permissionKey as PermissionOptionTypes];
    return Object.keys(permissionObj)
      .filter((pkId) => permissionObj[pkId] && permissionObj[pkId].option === optionType);
  }

  return [];
};

export const utGetDataForQueryByPrivileges = (
  privileges: PrivilegeTypeV1["privileges"],
  permissions: string[],
  optionType: string,
): { allDomainsIds: string[], yesGroupIds?: string[] } | null => {
  const permissionKey = utGetPermissionKeyWhereTypeIs(privileges.group.permissions, optionType);
  const allInDomainsIds = utGetAllIdsFromPermissionOfType(privileges.group, permissionKey, optionType);
  if (allInDomainsIds.length) {
    if (utCanViewAssigned(permissions)) {
      const yesPermissionKey = utGetPermissionKeyWhereTypeIs(privileges.group.permissions, P_OPTION_YES);
      const yesGroupIds = utGetAllIdsFromPermissionOfType(privileges.group, yesPermissionKey, P_OPTION_YES);
      return {
        allDomainsIds: allInDomainsIds,
        yesGroupIds,
      };
    }
    return {
      allDomainsIds: allInDomainsIds,
    };
  }
  return null;
};

export const utGetAllIdsFromPermissionOfTypeForGroupUser = (
  permissions: PrivilegeTypeV1["privileges"]["groupUser"],
  permissionKey: string,
  optionType: string,
): string[] => {
  if (permissions && permissionKey && typeof permissions[permissionKey as PermissionOptionTypes] === "object") {
    const permissionObj = permissions[permissionKey as PermissionOptionTypes];
    return Object.keys(permissionObj)
      .filter((pkId) => permissionObj[pkId] && permissionObj[pkId].option === optionType);
  }

  return [];
};

export const utGetAllIdsFromPermissionOfTypeForCampaign = (
  permissions: PrivilegeTypeV1["privileges"]["campaign"],
  permissionKey: string,
  optionType: string,
): string[] => {
  if (permissions && permissionKey && typeof permissions[permissionKey as PermissionOptionTypes] === "object") {
    const permissionObj = permissions[permissionKey as PermissionOptionTypes];
    return Object.keys(permissionObj)
      .filter((pkId) => permissionObj[pkId] && permissionObj[pkId].option === optionType);
  }

  return [];
};

export const utHasPermission = (
  privileges: { permissions: string[] }, permission: string,
): boolean => (Array.isArray(privileges.permissions) && privileges.permissions.includes(permission));

export const utIsAccessAllowed = (
  user: UserSessionType, permissionType: PermissionOptionTypes | "any", entityType: EntityTypes,
): boolean => {
  const privileges = user?.privileges;
  if (privileges) {
    if (utHasPermission(privileges, PERMISSIONS.DO_ALL)) return true;

    if ((privileges && privileges[entityType])) {
      const permissionObj = privileges[entityType] as unknown as PrivilegeTypeV1["privileges"];
      if (permissionObj) {
        if (permissionType !== "any") return !!permissionObj[permissionType];
        return !!(permissionObj.v || permissionObj.c || permissionObj.d || permissionObj.e);
      }
      return true;
    }
  }

  return false;
};

export const utGetSelectedInstanceIds = (
  selectedInstances: tpUserInstances[],
): string[] => selectedInstances.map((instance: tpUserInstances) => instance.gEntityId);
