import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../base/dao/doBase";
import MdUser from "./mdUser";
import MdCredential from "./credentials/mdCredential";
import MdFile from "../shared/module/files/mdFile";
import knex from "../../base/database/cfgKnex";
import MdEntity from "../entity/mdEntity";
import { EntityStatusTypesType, tpGetType } from "../shared/types/tpShared";

const selectColumns = [
  MdUser.col("uId"),
  MdUser.col("uEntityId"),
  MdUser.col("uFirstName"),
  MdUser.col("uLastName"),
  MdUser.col("uCreatedAt"),
  MdCredential.col("cEmail"),
];
class DoUser extends DoBase<MdUser> {
  constructor() {
    super(MdUser.TABLE_NAME);
  }

  getDefaultQb(trx: Transaction) {
    return trx(this.tableName)
      .select([
        ...selectColumns,
        knex.ref(MdFile.col("fPath"))
          .as("picture"),
        MdFile.col("fId"),
      ])
      .join(MdEntity.TABLE_NAME, MdEntity.col("entityId"), MdUser.col("uEntityId"))
      .join(MdCredential.TABLE_NAME, MdCredential.col("cUserEntityId"), this.col("uEntityId"))
      .leftJoin(MdFile.TABLE_NAME, (qb1) => {
        qb1.on(MdFile.col("fEntityId"), this.col("uEntityId"))
          .andOn(MdFile.col("fType"), knex.raw("?", [MdFile.type("image")]));
      })
      .where(MdEntity.col("entityStatus"), tpGetType<EntityStatusTypesType>("active"))
      .groupBy([
        ...selectColumns,
        MdFile.col("fPath"),
        MdFile.col("fId"),
      ]);
  }

  getAllUsers(
    trx: Transaction,
  ): QueryBuilder<(MdUser & MdCredential)[]> {
    return trx(this.tableName)
      .select([
        ...selectColumns,
        knex.ref(MdFile.col("fPath"))
          .as("picture"),
        MdFile.col("fId"),
      ])
      .leftJoin(MdFile.TABLE_NAME, (qb1) => {
        qb1.on(MdFile.col("fEntityId"), this.col("uEntityId"))
          .andOn(MdFile.col("fType"), trx.raw("?", [MdFile.type("image")]));
      })
      .orderBy(this.col("uCreatedAt"), "desc");
  }

  getAllUsersByQb(
    qb: QueryBuilder,
  ): QueryBuilder {
    return qb.orderBy(this.col("uCreatedAt"), "desc");
  }
}

export default new DoUser();
