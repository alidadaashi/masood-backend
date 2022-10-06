import { Transaction } from "knex";
import PrivilegeOptionSelectedModel from "./mdPrivilegeOptionSelected";
import DoBase from "../../../../base/dao/doBase";
import MdPrivilegeOption from "../privilegeOption/mdPrivilegeOption";

class DoPrivilegeOptionSelected extends DoBase<PrivilegeOptionSelectedModel> {
  constructor() {
    super(PrivilegeOptionSelectedModel.TABLE_NAME);
  }

  getOptionsDetailsByRolePermission(trx: Transaction, rolePermissionId: string): Promise<MdPrivilegeOption[]> {
    return trx(this.tableName)
      .select([
        MdPrivilegeOption.col("poId"),
        MdPrivilegeOption.col("poOption"),
        MdPrivilegeOption.col("poOptionType"),
      ])
      .leftJoin(MdPrivilegeOption.TABLE_NAME, MdPrivilegeOption.col("poId"), this.col("posPrivilegeOptionId"))
      .where(this.col("posRolePrivilegeId"), rolePermissionId)
      .orderBy(this.col("posCreatedAt"));
  }
}

export default new DoPrivilegeOptionSelected();
