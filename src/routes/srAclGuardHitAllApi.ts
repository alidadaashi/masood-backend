import { PermissionOptionTypes, PrivilegeTypeV1 } from "../module/shared/types/tpShared";
import {
  PERMISSIONS, P_OPTION_ALL_IN_GROUP,
} from "../module/shared/constants/dtPermissionConstants";
import { utGetAllPermissionValues } from "./utAclHelper";
import { utIsItgAdmin } from "../module/shared/utils/utAuth";

const utGetAllIdsFromPermissionOfTypeForHitAllApi = (
  permissions: PrivilegeTypeV1["privileges"]["hitAllApi"],
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

const srGetDataForQueryByPrivileges = (
  privileges: PrivilegeTypeV1["privileges"], optionType: string,
): { allGroupIds: string[] } | null => {
  const allInGroupIds = utGetAllIdsFromPermissionOfTypeForHitAllApi(privileges.hitAllApi, "f", optionType);
  if (allInGroupIds.length) {
    return { allGroupIds: allInGroupIds };
  }
  return null;
};

const srCanHitApiAllInGroup = (
  privileges: PrivilegeTypeV1["privileges"], campaignInstanceId: string,
) => {
  const data = srGetDataForQueryByPrivileges(privileges, P_OPTION_ALL_IN_GROUP);
  if (data) {
    return !!data.allGroupIds.includes(campaignInstanceId);
  }
  return false;
};

class SrAclGuardHitAllApi {
  static srCanHitCampaignAllApi(
    privs: PrivilegeTypeV1,
    campInstanceId: string,
  ): null | boolean {
    let qb = false;
    if (privs.privileges) {
      const permissions = utGetAllPermissionValues({
        f: privs.privileges.hitAllApi.permissions.f,
      } as Record<PermissionOptionTypes, string>);
      if (utIsItgAdmin(privs)) return true;
      if (!privs.privileges.permissions.includes(PERMISSIONS.CAMPAIGN_HIT_API)) return false;
      if (permissions.includes(P_OPTION_ALL_IN_GROUP)) {
        qb = srCanHitApiAllInGroup(privs.privileges, campInstanceId);
      }
    }

    return qb;
  }
}

export default SrAclGuardHitAllApi;
