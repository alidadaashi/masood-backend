import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../../../base/dao/doBase";
import MdProfileRole from "./mdProfileRole";
import MdProfile from "../mdProfile";
import MdUser from "../../../user/mdUser";
import MdRole from "../../role/mdRole";
import MdRolePrivilege from "../../role/rolePrivilege/mdRolePrivilege";
import MdPrivilege from "../../permission/mdPrivilege";

const selectColumns = [
  MdRole.col("rRoleId"),
  MdRole.col("rRoleName"),
];

class DoProfileRole extends DoBase<MdProfileRole> {
  constructor() {
    super(MdProfileRole.TABLE_NAME);
  }

  getAllUserProfiles(trx: Transaction): QueryBuilder {
    return trx(this.tableName)
      .select(
        MdUser.col("uFirstName"),
        MdProfile.col("pProfileName"),
        trx.raw("JSON_AGG(??) AS roles", [MdRole.col("rRoleName", false)]),
        trx.raw("JSON_AGG(??) AS permissions", [MdPrivilege.col("pPrivilege", false)]),
      )
      .join(MdProfile.TABLE_NAME, MdProfile.col("pProfileId"), this.col("prProfileId"))
      .leftJoin(MdRole.TABLE_NAME, MdRole.col("rRoleId"), this.col("prRoleId"))
      .leftJoin(MdRolePrivilege.TABLE_NAME, MdRolePrivilege.col("rpRoleId"), MdRole.col("rRoleId"))
      .leftJoin(MdPrivilege.TABLE_NAME, MdPrivilege.col("pId"), MdRolePrivilege.col("rpPrivilegeId"))
      .groupBy(
        MdUser.col("uFirstName"),
        MdProfile.col("pProfileName"),
      );
  }

  getProfileRoles(trx: Transaction, pId: string): QueryBuilder {
    return trx(this.tableName)
      .select(selectColumns)
      .join(MdRole.TABLE_NAME, MdRole.col("rRoleId"), this.col("prRoleId"))
      .where(this.col("prProfileId"), pId);
  }

  getProfileRolesIn(trx: Transaction, pId: string[]): Promise<MdRole[]> {
    return trx(this.tableName)
      .select(selectColumns)
      .join(MdRole.TABLE_NAME, MdRole.col("rRoleId"), this.col("prRoleId"))
      .whereIn(this.col("prProfileId"), pId);
  }
}

export default new DoProfileRole();
