import { QueryBuilder, Transaction } from "knex";
import MdCompanyDetails from "../../entities/company/mdCompanyDetails";
import DoBase from "../../../base/dao/doBase";
import MdDocAndNoteTypeCompany from "./mdDocAndNoteTypeCompany";
import MdGroupDetails from "../../entities/group/mdGroupDetails";

class DoDocAndNoteTypeCompany extends DoBase<MdDocAndNoteTypeCompany> {
  constructor() {
    super(MdDocAndNoteTypeCompany.TABLE_NAME);
  }

  getDocAndNoteTypeCompany(
    trx: Transaction,
  ): QueryBuilder {
    let companyQb = trx(this.tableName);
    const companyWhere = trx.raw(companyQb.whereRaw("\"docAndNoteType_company\".\"dntcDocOrNoteTypeId\"= SUBQ.\"dntId\"")
      .toQuery()).wrap("(", ")");
    const companySubQ = trx.raw("? as companySUBQ", [companyWhere]);
    const companyJoinQb = trx.select("*")
      .from(companySubQ).leftJoin(MdCompanyDetails.TABLE_NAME, (join) => (join.on(MdCompanyDetails.col("cEntityId"),
        trx.raw("companySUBQ.\"dntcCompanyId\"")))).leftJoin(MdGroupDetails
        .TABLE_NAME, (join) => (join.on(MdGroupDetails.col("gEntityId"),
        trx.raw("\"company_details\".\"cInstanceEntityId\""))));

    companyQb = trx.select([trx.raw("row_to_json(companyJoinSUBQ)")]).from(trx.raw("? as companyJoinSUBQ", [companyJoinQb]));
    return companyQb;
  }
}

export default new DoDocAndNoteTypeCompany();
