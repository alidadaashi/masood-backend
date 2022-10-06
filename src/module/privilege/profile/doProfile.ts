import { Transaction } from "knex";
import MdProfile from "./mdProfile";
import DoBase from "../../../base/dao/doBase";
import MdCredential from "../../user/credentials/mdCredential";

class DoProfile extends DoBase<MdProfile> {
  constructor() {
    super(MdProfile.TABLE_NAME);
  }

  findExistingProfileByNameAndNotId(
    trx: Transaction, id: string, profileName: string,
  ): Promise<MdCredential> {
    return trx(this.tableName)
      .where(this.col("pProfileName"), profileName)
      .andWhereNot(this.col("pProfileId"), id)
      .first();
  }
}

export default new DoProfile();
