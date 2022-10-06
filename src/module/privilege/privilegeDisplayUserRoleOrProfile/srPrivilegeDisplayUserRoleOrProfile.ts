import { Transaction } from "knex";
import { ReqBodyUserPrivilegesType } from "../../shared/types/tpShared";
import DoUser from "../../user/doUser";
import DoPrivilegeDisplayUserRoleOrProfile from "./doPrivilegeDisplayUserRoleOrProfile";
import DoPrivilegeDisplayUserEntity from "../privilegeDisplayUserEntity/doPrivilegeUserEntity";

class SrPrivilegeDisplayUserRoleOrProfile {
  static async getUserAllPrivilegesProfiles(
    trx: Transaction,
    userEntityId: string,
  ): Promise<ReqBodyUserPrivilegesType> {
    const user = await DoUser.findOneByCol(trx, "uEntityId", userEntityId);
    const profiles = await DoPrivilegeDisplayUserRoleOrProfile.getUserAllPrivilegesProfiles(trx, userEntityId);
    const roles = await DoPrivilegeDisplayUserRoleOrProfile.getUserAllPrivilegesRoles(trx, userEntityId);

    const domains = await DoPrivilegeDisplayUserEntity.getUserAllPrivilegesDomains(trx, userEntityId);
    const groups = await DoPrivilegeDisplayUserEntity.getUserAllPrivilegesGroups(trx, userEntityId);

    return {
      user,
      profiles,
      roles,
      domains,
      groups,
    } as ReqBodyUserPrivilegesType;
  }
}

export default SrPrivilegeDisplayUserRoleOrProfile;
