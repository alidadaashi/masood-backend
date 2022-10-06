import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdModule from "./mdModule";
import { EntityStatusTypesType, tpGetType } from "../../shared/types/tpShared";

class DoModule extends DoBase<MdModule> {
  constructor() {
    super(MdModule.TABLE_NAME);
  }

  getModuleHierarchy(trx: Transaction, columns: (((keyof MdModule) | string)[]) | string = "*"): QueryBuilder {
    return trx.withRecursive("t", (qb) => {
      qb.select([`${this.tableName}.*`,
        trx.raw(`array[row(${trx.raw("??",
          [this.col("mModuleName")])})::node_pos] as path, 1 as depth`)])
        .from(this.tableName)
        .where(this.col("mModuleParentId"), null)
        .where(this.col("mModuleType"), "privilege")
        .andWhere(this.col("mModuleStatus"), tpGetType<EntityStatusTypesType>("active"))
        .unionAll((qb2) => {
          qb2.select([`${this.tableName}.*`,
            trx.raw(`path || row(
             ${trx.raw("??",
    [MdModule.col("mModuleName")])})::node_pos, t.depth + 1`)])
            .from(this.tableName)
            .join("t", function q() {
              this.on(MdModule.col("mModuleParentId"),
                trx.raw("t.??", [MdModule.col("mModuleId", false)]));
            });
        });
    })
      .select(columns)
      .from("t")
      .orderBy("path");
  }
}

export default new DoModule();
