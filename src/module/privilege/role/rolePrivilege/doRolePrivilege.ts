import { Transaction } from "knex";
import DoBase from "../../../../base/dao/doBase";
import MdRolePrivilege from "./mdRolePrivilege";
import MdPrivilege from "../../permission/mdPrivilege";
import MdPrivilegeOptionSelected from "../../permission/privilegeOptionSelected/mdPrivilegeOptionSelected";
import MdPrivilegeOption from "../../permission/privilegeOption/mdPrivilegeOption";
import { GetAllRolePermissionsType } from "../../../shared/types/tpShared";

class DoRolePrivilege extends DoBase<MdRolePrivilege> {
  constructor() {
    super(MdRolePrivilege.TABLE_NAME);
  }

  getAllRolePermissionsDetailsByRoles(
    trx: Transaction, roleIds: string[],
  ): Promise<GetAllRolePermissionsType[]> {
    return trx(this.tableName)
      .select([
        this.col("rpPrivilegeId"),
        MdPrivilege.col("pPrivilege"),
        trx.raw(`
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'poOption', ??,
              'poOptionType', ??
            )
          ) as "permissionOptions"
        `, [
          MdPrivilegeOption.col("poOption"),
          MdPrivilegeOption.col("poOptionType"),
        ]),
      ])
      .join(MdPrivilege.TABLE_NAME, MdPrivilege.col("pId"), this.col("rpPrivilegeId"))
      .leftJoin(MdPrivilegeOptionSelected.TABLE_NAME,
        MdPrivilegeOptionSelected.col("posRolePrivilegeId"), this.col("rpId"))
      .leftJoin(MdPrivilegeOption.TABLE_NAME, MdPrivilegeOption.col("poId"),
        MdPrivilegeOptionSelected.col("posPrivilegeOptionId"))
      .groupBy([
        this.col("rpPrivilegeId"),
        MdPrivilege.col("pPrivilege"),
      ])
      .whereIn(this.col("rpRoleId"), roleIds);
  }
}

export default new DoRolePrivilege();
