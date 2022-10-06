import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdDocAndNoteTypeInstance from "./mdDocAndNoteTypeInstance";
import MdGroupDetails from "../../entities/group/mdGroupDetails";

class DoDocAndNoteTypeInstance extends DoBase<MdDocAndNoteTypeInstance> {
  constructor() {
    super(MdDocAndNoteTypeInstance.TABLE_NAME);
  }

  getDocAndNoteTypeInstance(
    trx: Transaction,
  ): QueryBuilder {
    let instanceQb = trx(this.tableName);
    const instanceWhere = trx.raw(instanceQb.whereRaw("\"docAndNoteType_instance\".\"dntiDocOrNoteTypeId\"= SUBQ.\"dntId\"")
      .toQuery()).wrap("(", ")");
    const InstanceSubQ = trx.raw("? as instanceSUBQ", [instanceWhere]);
    instanceQb = trx.select([trx.raw("row_to_json(\"group_details\")")])
      .from(InstanceSubQ).leftJoin(MdGroupDetails.TABLE_NAME, (join) => (join.on(MdGroupDetails.col("gEntityId"),
        trx.raw("instanceSUBQ.\"dntiInstanceId\""))));

    return instanceQb;
  }
}

export default new DoDocAndNoteTypeInstance();
