import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import PrivilegeUserRoleOrProfileModel from "./mdPrivilegeUserRoleOrProfile";
import { tpGetType, PrivilegesSetsType } from "../../shared/types/tpShared";
import MdProfile from "../profile/mdProfile";
import MdRole from "../role/mdRole";

class DoPrivilegeDisplayUserRoleOrProfile extends DoBase<PrivilegeUserRoleOrProfileModel> {
  constructor() {
    super(PrivilegeUserRoleOrProfileModel.TABLE_NAME);
  }

  getUserAllPrivilegesProfiles(trx: Transaction, userId: string): QueryBuilder<MdProfile[]> {
    return trx(this.tableName)
      .select(trx.raw("??.*", MdProfile.TABLE_NAME))
      .join(MdProfile.TABLE_NAME, MdProfile.col("pProfileId"), this.col("purpProfileOrRoleId"))
      .where(this.col("purpUserEntityId"), userId)
      .andWhere(this.col("purpPrivilegeType"), tpGetType<PrivilegesSetsType>("profile"))
      .groupBy(MdProfile.col("pProfileId"));
  }

  getUserAllPrivilegesRoles(trx: Transaction, userId: string): QueryBuilder<MdRole[]> {
    return trx(this.tableName)
      .select(trx.raw("??.*", MdRole.TABLE_NAME))
      .join(MdRole.TABLE_NAME, MdRole.col("rRoleId"), this.col("purpProfileOrRoleId"))
      .where(this.col("purpUserEntityId"), userId)
      .andWhere(this.col("purpPrivilegeType"), tpGetType<PrivilegesSetsType>("role"))
      .groupBy(MdRole.col("rRoleId"));
  }
}

export default new DoPrivilegeDisplayUserRoleOrProfile();
