import { Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdLanguages from "./mdLanguages";
import { tpGetType } from "../../shared/types/tpShared";

class DoLanguages extends DoBase<MdLanguages> {
  constructor() {
    super(MdLanguages.TABLE_NAME);
  }

  getAllActiveLanguages(trx: Transaction) {
    return trx(this.tableName).where(this.col("lStatus"), tpGetType<MdLanguages["lStatus"]>("active"));
  }
}

export default new DoLanguages();
