import { Transaction } from "knex";
import MdPrivilege from "./mdPrivilege";
import DoBase from "../../../base/dao/doBase";
import MdPrivilegeOption from "./privilegeOption/mdPrivilegeOption";

class DoPrivilege extends DoBase<MdPrivilege> {
  constructor() {
    super(MdPrivilege.TABLE_NAME);
  }

  getAllPermissionsByModule(trx: Transaction, moduleId: string)
    : Promise<(MdPrivilege & { poPermissionOptions: MdPrivilegeOption[] })[]> {
    return trx(this.tableName)
      .select(
        this.col("pId"),
        this.col("pPrivilege"),
        this.col("pModuleId"),
        trx.raw(`
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'poId', privilege_option."poId",
                'poOption', privilege_option."poOption",
                'poOptionType', privilege_option."poOptionType"
              )
            ) FILTER (WHERE privilege_option."poId" IS NOT NULL) as "poPermissionOptions"
        `),
      )
      .leftJoin(MdPrivilegeOption.TABLE_NAME, MdPrivilegeOption.col("poPrivilegeId"), this.col("pId"))
      .where(this.col("pModuleId"), moduleId)
      .groupBy(this.col("pId"), this.col("pPrivilege"));
  }

  getAllUniqueModuleIdsByRolePermissions(trx: Transaction, permissionIds: string[]): Promise<string[]> {
    return trx(this.tableName)
      .distinct(this.col("pModuleId"))
      .whereIn(this.col("pId"), permissionIds)
      .pluck(this.col("pModuleId"));
  }
}

export default new DoPrivilege();
