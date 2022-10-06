import { QueryBuilder, Transaction } from "knex";
import MdCompanyDetails from "./mdCompanyDetails";
import DoBase from "../../../base/dao/doBase";
import MdGroupDetails from "../group/mdGroupDetails";
import { tpCompanies } from "../../shared/types/tpShared";

class DoCompanyDetails extends DoBase<MdCompanyDetails> {
  constructor() {
    super(MdCompanyDetails.TABLE_NAME);
  }

  getAllCompaniesQb(trx: Transaction, instIds?:string[]): QueryBuilder<tpCompanies[]> {
    const qb = trx(this.tableName);
    qb.select([
      this.col("cId"),
      this.col("cInstanceEntityId"),
      MdGroupDetails.col("gName"),
      this.col("cEntityId"),
      this.col("cName"),
      this.col("cCreatedAt"),
    ])
      .innerJoin(MdGroupDetails.TABLE_NAME, (join) => join.on(
        this.col("cInstanceEntityId"), MdGroupDetails.col("gEntityId"),
      ))
      .orderBy(this.col("cCreatedAt"), "asc");

    if (instIds && instIds.length > 0) qb.whereIn(this.col("cInstanceEntityId"), instIds);
    return qb;
  }
}

export default new DoCompanyDetails();
