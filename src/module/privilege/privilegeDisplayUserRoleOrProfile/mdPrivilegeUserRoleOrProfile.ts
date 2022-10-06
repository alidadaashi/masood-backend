import { PrivilegesSetsType } from "../../shared/types/tpShared";

class MdPrivilegeUserRoleOrProfile {
  static TABLE_NAME = "privilege_user_role_or_profile";

  constructor(
    public purpUserEntityId: string,
    public purpProfileOrRoleId: string,
    public purpPrivilegeType: PrivilegesSetsType,
    public purpCreatedAt?: string,
    public purpId?: string,
  ) {
  }

  static col(k: keyof MdPrivilegeUserRoleOrProfile, prefix = true): string {
    return prefix ? `${MdPrivilegeUserRoleOrProfile.TABLE_NAME}.${k}` : k;
  }
}

export default MdPrivilegeUserRoleOrProfile;
