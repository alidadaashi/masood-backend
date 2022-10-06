import { QueryBuilder, Transaction } from "knex";
import MdEntity from "./mdEntity";
import DoBase from "../../base/dao/doBase";
import MdGroupDetails from "../entities/group/mdGroupDetails";

class DoEntity extends DoBase<MdEntity> {
  constructor() {
    super(MdEntity.TABLE_NAME);
  }

  disableDomainAndChildren(trx: Transaction, domainEntityId: string): QueryBuilder {
    return trx(this.tableName)
      .update({ entityStatus: "disabled" })
      .where(MdEntity.col("entityId"), domainEntityId)
      .orWhereIn(MdEntity.col("entityId"), (qis) => qis.from(MdGroupDetails.TABLE_NAME)
        .select(MdGroupDetails.col("gEntityId"))
        .where(MdGroupDetails.col("gDomainEntityId"), domainEntityId));
  }
}

export default new DoEntity();
