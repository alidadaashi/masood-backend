import { QueryBuilder, Transaction } from "knex";
import MdDomainDetails from "./mdDomainDetails";
import DoBase from "../../../base/dao/doBase";
import MdEntityUser from "../../entity/entityUser/mdEntityUser";
import MdUser from "../../user/mdUser";
import MdCredential from "../../user/credentials/mdCredential";
import MdEntity from "../../entity/mdEntity";
import { EntityStatusTypesType, tpGetType } from "../../shared/types/tpShared";
import MdCreatorEntity from "../creatorEntity/mdCreatorEntity";
import DoUser from "../../user/doUser";

const selectColumns = [
  MdUser.col("uFirstName"),
  MdUser.col("uLastName"),
  MdUser.col("uId"),
  MdCredential.col("cEmail"),
  MdCredential.col("cId"),
];

class DoDomainDetails extends DoBase<MdDomainDetails> {
  constructor() {
    super(MdDomainDetails.TABLE_NAME);
  }

  getDefaultQb(trx: Transaction): QueryBuilder {
    return trx(this.tableName)
      .select(MdCreatorEntity.col("ceCreatorId"))
      .join(MdEntity.TABLE_NAME, MdEntity.col("entityId"), this.col("dEntityId"))
      .leftJoin(MdCreatorEntity.TABLE_NAME, MdCreatorEntity.col("ceEntityId"), MdDomainDetails.col("dEntityId"))
      .where(MdEntity.col("entityStatus"), tpGetType<EntityStatusTypesType>("active"))
      .groupBy(MdCreatorEntity.col("ceCreatorId"));
  }

  getDefaultDomainUserQb(trx: Transaction): QueryBuilder {
    return DoUser.getDefaultQb(trx)
      .join(MdEntityUser.TABLE_NAME, MdEntityUser.col("euUserEntityId"), MdUser.col("uEntityId"))
      .join(this.tableName, this.col("dEntityId"), MdEntityUser.col("euEntityId"));
  }

  findExistingDomainByNameAndNotEntity(
    trx: Transaction, domainId: string, domain: string,
  ): Promise<MdCredential> {
    return trx(this.tableName)
      .where(this.col("dName"), domain)
      .andWhereNot(this.col("dId"), domainId)
      .first();
  }

  getAllDomainsByQb(qb: QueryBuilder): QueryBuilder<MdDomainDetails[]> {
    return qb
      .select([
        this.col("dId"),
        this.col("dEntityId"),
        this.col("dName"),
        this.col("dCreatedAt"),
      ])
      .groupBy([
        this.col("dId"),
        this.col("dEntityId"),
        this.col("dName"),
        this.col("dCreatedAt"),
      ]);
  }

  getDomainDetails(trx: Transaction, domainId: string): Promise<MdDomainDetails & MdUser> {
    const qb = trx(this.tableName);

    return this.getAllDomainsByQb(qb)
      .select(selectColumns)
      .join(MdEntity.TABLE_NAME, MdEntity.col("entityId"), this.col("dEntityId"))
      .join(MdEntityUser.TABLE_NAME, MdEntityUser.col("euEntityId"), this.col("dEntityId"))
      .join(MdUser.TABLE_NAME, MdUser.col("uEntityId"), MdEntityUser.col("euUserEntityId"))
      .join(MdCredential.TABLE_NAME, MdCredential.col("cUserEntityId"), MdUser.col("uEntityId"))
      .where(this.col("dId"), domainId)
      .andWhere(MdEntity.col("entityStatus"), tpGetType<EntityStatusTypesType>("active"))
      .groupBy(selectColumns)
      .first();
  }
}

export default new DoDomainDetails();
