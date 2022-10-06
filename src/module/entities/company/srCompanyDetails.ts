import { QueryBuilder, Transaction } from "knex";
import { tpCompanies } from "../../shared/types/tpShared";
import DoCompanyDetails from "./doCompanyDetails";

class SrCompanyDetails {
  static getAllCompanies(trx: Transaction, instIds?: string[]): QueryBuilder<tpCompanies[]> {
    return DoCompanyDetails.getAllCompaniesQb(trx, instIds);
  }
}

export default SrCompanyDetails;
