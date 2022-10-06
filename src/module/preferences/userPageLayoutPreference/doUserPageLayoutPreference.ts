import { Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdUserPageLayoutPreference from "./mdUserPageLayoutPreference";

class DoUserPageLayoutPreference extends DoBase<MdUserPageLayoutPreference> {
  constructor() {
    super(MdUserPageLayoutPreference.TABLE_NAME);
  }

  async isPreferenceLayoutNameExists(
    trx: Transaction,
    parentPagePreferenceId: string,
    preferenceName: string,
    preferenceId?: string,
  ):Promise<boolean> {
    const qb = trx(this.tableName)
      .where(this.col("uplpName"), preferenceName)
      .where(this.col("uplpPagePreferenceId"), parentPagePreferenceId)
      .first();
    if (preferenceId) {
      return !!await qb.andWhereNot(this.col("uplpId"), preferenceId);
    }
    return !!await qb;
  }
}

export default new DoUserPageLayoutPreference();
