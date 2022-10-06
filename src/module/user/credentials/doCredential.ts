import { Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdCredential from "./mdCredential";

class DoCredential extends DoBase<MdCredential> {
  constructor() {
    super(MdCredential.TABLE_NAME);
  }

  findExistingCredentialsByEmailAndNotEntity(
    trx: Transaction, entityUserId: string, email: string,
  ): Promise<MdCredential> {
    return trx(this.tableName)
      .where(this.col("cEmail"), email)
      .andWhereNot(this.col("cUserEntityId"), entityUserId)
      .first();
  }
}

export default new DoCredential();
