import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdRole from "./mdRole";
import MdCredential from "../../user/credentials/mdCredential";
import { EntityStatusTypesType, tpGetType } from "../../shared/types/tpShared";

class DoRole extends DoBase<MdRole> {
  constructor() {
    super(MdRole.TABLE_NAME);
  }

  getDefaultQb(trx: Transaction): QueryBuilder {
    return trx(this.tableName)
      .where(this.col("rRoleStatus"), tpGetType<EntityStatusTypesType>("active"));
  }

  findExistingRoleByNameAndNotId(
    trx: Transaction, id: string, roleName: string,
  ): Promise<MdCredential> {
    return trx(this.tableName)
      .where(this.col("rRoleName"), roleName)
      .andWhereNot(this.col("rRoleId"), id)
      .first();
  }
}

export default new DoRole();
