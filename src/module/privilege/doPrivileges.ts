import { QueryBuilder, Transaction } from "knex";
import MdUser from "../user/mdUser";
import MdRole from "./role/mdRole";
import MdDomainDetails from "../entities/domain/mdDomainDetails";
import MdGroupDetails from "../entities/group/mdGroupDetails";
import { AllUsersAllPrivilegesType } from "../shared/types/tpShared";
import MdPrivilege from "./permission/mdPrivilege";
import PrivilegeOptionSelectedModel from "./permission/privilegeOptionSelected/mdPrivilegeOptionSelected";
import MdPrivilegeOption from "./permission/privilegeOption/mdPrivilegeOption";
import MdRolePrivilege from "./role/rolePrivilege/mdRolePrivilege";
import MdProfile from "./profile/mdProfile";
import PrivilegeUserRoleOrProfileModel from "./privilegeDisplayUserRoleOrProfile/mdPrivilegeUserRoleOrProfile";
import MdPrivilegeUserEntity from "./privilegeDisplayUserEntity/mdPrivilegeUserEntity";

class DoPrivileges {
  static getAllUsersAllPrivileges(trx: Transaction): QueryBuilder<AllUsersAllPrivilegesType[]> {
    const qb = trx(MdUser.TABLE_NAME)
      .select([
        MdUser.col("uEntityId"),
        MdUser.col("uFirstName"),
        MdRole.col("rRoleName"),
        MdDomainDetails.col("dName"),
        MdGroupDetails.col("gName"),
        MdProfile.col("pProfileName"),
      ])

      .leftJoin(MdPrivilegeUserEntity.TABLE_NAME,
        MdPrivilegeUserEntity.col("pueUserEntityId"), MdUser.col("uEntityId"))

      .leftJoin(PrivilegeUserRoleOrProfileModel.TABLE_NAME,
        PrivilegeUserRoleOrProfileModel.col("purpUserEntityId"), MdUser.col("uEntityId"))

      .leftJoin(MdProfile.TABLE_NAME, MdProfile.col("pProfileId"),
        PrivilegeUserRoleOrProfileModel.col("purpProfileOrRoleId"))

      .leftJoin(MdRole.TABLE_NAME, MdRole.col("rRoleId"),
        PrivilegeUserRoleOrProfileModel.col("purpProfileOrRoleId"))

      .leftJoin(MdDomainDetails.TABLE_NAME, MdDomainDetails.col("dEntityId"),
        MdPrivilegeUserEntity.col("pueEntityId"))

      .leftJoin(MdGroupDetails.TABLE_NAME, MdGroupDetails.col("gEntityId"),
        MdPrivilegeUserEntity.col("pueEntityId"));
    return qb;
  }

  static getAllUsersAllPrivilegesWithOptions(trx: Transaction): QueryBuilder<AllUsersAllPrivilegesType[]> {
    return DoPrivileges.getAllUsersAllPrivileges(trx)
      .select(
        MdPrivilegeOption.col("poOptionType"),
        MdPrivilegeOption.col("poOption"),
      )
      .leftJoin(MdRolePrivilege.TABLE_NAME, MdRolePrivilege.col("rpRoleId"), MdRole.col("rRoleId"))
      .leftJoin(MdPrivilege.TABLE_NAME, MdPrivilege.col("pId"), MdRolePrivilege.col("rpPrivilegeId"))
      .leftJoin(PrivilegeOptionSelectedModel.TABLE_NAME,
        PrivilegeOptionSelectedModel.col("posRolePrivilegeId"), MdRolePrivilege.col("rpId"))
      .leftJoin(MdPrivilegeOption.TABLE_NAME, MdPrivilegeOption.col("poId"),
        PrivilegeOptionSelectedModel.col("posPrivilegeOptionId"))
      .groupBy([
        MdPrivilegeOption.col("poOption"),
        MdPrivilegeOption.col("poOptionType"),
        MdUser.col("uEntityId"),
        MdUser.col("uFirstName"),
        MdRole.col("rRoleName"),
        MdDomainDetails.col("dName"),
        MdGroupDetails.col("gName"),
        MdProfile.col("pProfileName"),
      ]);
  }
}

export default DoPrivileges;
