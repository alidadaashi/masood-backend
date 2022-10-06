import { Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdUserPageQueryPreference from "./mdUserPageQueryPreference";

class DoUserPageQueryPreference extends DoBase<MdUserPageQueryPreference> {
  constructor() {
    super(MdUserPageQueryPreference.TABLE_NAME);
  }

  async isPreferenceQueryPreferenceExists(
    trx: Transaction,
    parentPagePreferenceId: string,
    preferenceName: string,
    preferenceId?: string,
  ):Promise<boolean> {
    const qb = trx(this.tableName)
      .where(this.col("upqpName"), preferenceName)
      .where(this.col("upqpPagePreferenceId"), parentPagePreferenceId)
      .first();
    if (preferenceId) {
      return !!await qb.andWhereNot(this.col("upqpId"), preferenceId);
    }
    return !!await qb;
  }
}

export default new DoUserPageQueryPreference();
