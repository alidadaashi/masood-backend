import { QueryBuilder, Transaction } from "knex";
import MdGroupDetails from "./mdGroupDetails";
import DoBase from "../../../base/dao/doBase";
import MdDomainDetails from "../domain/mdDomainDetails";
import MdUser from "../../user/mdUser";
import MdCredential from "../../user/credentials/mdCredential";
import MdEntityUser from "../../entity/entityUser/mdEntityUser";
import knex from "../../../base/database/cfgKnex";
import MdCreatorEntity from "../creatorEntity/mdCreatorEntity";
import MdEntity from "../../entity/mdEntity";
import { EntityStatusTypesType, tpGetType, tpUserInstances } from "../../shared/types/tpShared";
import DoUser from "../../user/doUser";

class DoGroupDetails extends DoBase<MdGroupDetails> {
  constructor() {
    super(MdGroupDetails.TABLE_NAME);
  }

  getDefaultQb(trx: Transaction) {
    return trx(this.tableName)
      .select(MdCreatorEntity.col("ceCreatorId"))
      .join(MdEntity.TABLE_NAME, MdEntity.col("entityId"), this.col("gEntityId"))
      .leftJoin(MdCreatorEntity.TABLE_NAME, MdCreatorEntity.col("ceEntityId"), MdGroupDetails.col("gEntityId"))
      .where(MdEntity.col("entityStatus"), tpGetType<EntityStatusTypesType>("active"))
      .groupBy(MdCreatorEntity.col("ceCreatorId"));
  }

  getDefaultGroupUserQb(trx: Transaction): QueryBuilder {
    return DoUser.getDefaultQb(trx)
      .join(MdEntityUser.TABLE_NAME, MdEntityUser.col("euUserEntityId"), MdUser.col("uEntityId"))
      .join(this.tableName, this.col("gEntityId"), MdEntityUser.col("euEntityId"))
      .leftJoin(MdCreatorEntity.TABLE_NAME, MdCreatorEntity.col("ceEntityId"), MdGroupDetails.col("gEntityId"));
  }

  getAllGroups(trx: Transaction): QueryBuilder<MdGroupDetails[]> {
    return trx(this.tableName)
      .select([
        this.col("gId"),
        this.col("gDomainEntityId"),
        this.col("gEntityId"),
        this.col("gName"),
        this.col("gCreatedAt"),
      ])
      .orderBy(this.col("gCreatedAt"), "desc");
  }

  getAllGroupsByQb(qb: QueryBuilder, domains?: string[]): QueryBuilder<MdGroupDetails[]> {
    qb.select([
      this.col("gId"),
      this.col("gDomainEntityId"),
      this.col("gEntityId"),
      this.col("gName"),
      this.col("gCreatedAt"),
      MdDomainDetails.col("dName"),
      knex.raw(`
        JSON_BUILD_OBJECT(
          ${knex.raw(":dId, :dId:", { dId: MdDomainDetails.col("dId", false) })},
          ${knex.raw(":dEntityId, :dEntityId:", { dEntityId: MdDomainDetails.col("dEntityId", false) })},
          ${knex.raw(":dName, :dName:", { dName: MdDomainDetails.col("dName", false) })}
        ) as domain
      `),
    ])
      .join(MdDomainDetails.TABLE_NAME, MdDomainDetails.col("dEntityId"), this.col("gDomainEntityId"))
      .orderBy(this.col("gCreatedAt"), "desc")
      .groupBy([
        this.col("gId"),
        this.col("gDomainEntityId"),
        this.col("gEntityId"),
        this.col("gName"),
        this.col("gCreatedAt"),
        MdDomainDetails.col("dName"),
        MdDomainDetails.col("dId", false),
        MdDomainDetails.col("dEntityId", false),
      ]);

    if (domains && domains.length) qb.whereIn(this.col("gDomainEntityId"), domains);

    return qb;
  }

  getGroupDetails(trx: Transaction, groupId: string): Promise<MdDomainDetails & MdUser> {
    const qb = this.getDefaultQb(trx);

    return this.getAllGroupsByQb(qb)
      .select([
        trx.raw(`
          JSON_BUILD_OBJECT(
            ${trx.raw(":dId, :dId:", { dId: MdDomainDetails.col("dId", false) })},
            ${trx.raw(":dEntityId, :dEntityId:", { dEntityId: MdDomainDetails.col("dEntityId", false) })},
            ${trx.raw(":dName, :dName:", { dName: MdDomainDetails.col("dName", false) })}
          ) as domain
        `),
        MdUser.col("uFirstName"),
        MdUser.col("uLastName"),
        MdUser.col("uId"),
        MdCredential.col("cEmail"),
        MdCredential.col("cId"),
      ])
      .join(MdEntityUser.TABLE_NAME, MdEntityUser.col("euEntityId"), this.col("gEntityId"))
      .join(MdUser.TABLE_NAME, MdUser.col("uEntityId"), MdEntityUser.col("euUserEntityId"))
      .join(MdCredential.TABLE_NAME, MdCredential.col("cUserEntityId"), MdUser.col("uEntityId"))
      .where(this.col("gId"), groupId)
      .groupBy([
        MdUser.col("uFirstName"),
        MdUser.col("uLastName"),
        MdUser.col("uId"),
        MdCredential.col("cEmail"),
        MdCredential.col("cId"),
      ])
      .first();
  }

  findExistingGroupByNameAndNotEntity(
    trx: Transaction, groupId: string, domain: string,
  ): Promise<MdCredential> {
    return trx(this.tableName)
      .where(this.col("gName"), domain)
      .andWhereNot(this.col("gId"), groupId)
      .first();
  }

  getAllUserInstancesByInstanceIds(trx: Transaction, instanceIds?: string[]): Promise<tpUserInstances[]> {
    const qb = trx(this.tableName)
      .select([
        this.col("gName"),
        this.col("gEntityId"),
        MdEntity.col("entityType"),
      ])
      .join(MdEntity.TABLE_NAME, MdEntity.col("entityId"), this.col("gEntityId"));

    if (instanceIds) qb.whereIn(this.col("gEntityId"), instanceIds);

    return qb;
  }
}

export default new DoGroupDetails();
