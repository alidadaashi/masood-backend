import { QueryBuilder, Transaction } from "knex";
import { tpNote, tpRecordsScope } from "../../../shared/types/tpShared";
import DoBase from "../../../../base/dao/doBase";
import MdNotes from "./mdNote";
import MdDocAndNoteType from "../../docAndNoteType/mdDocAndNoteType";
import MdUser from "../../../user/mdUser";

class DoNotes extends DoBase<MdNotes> {
  constructor() {
    super(MdNotes.TABLE_NAME);
  }

  getAllNotes(
    trx: Transaction,
    nScope: tpRecordsScope,
    rtetId: string,
  ): QueryBuilder<tpNote[]> {
    let qb = trx(MdNotes.TABLE_NAME);

    qb = qb
      .select([
        "nId",
        "nNoteTypeId",
        "nBody",
        "nScope",
        "nStatus",
        "dntName",
        "nCreatedByUserId",
        "nCreatedAt",
        "nUpdatedAt",
        "uFirstName",
      ])
      .join(
        MdDocAndNoteType.TABLE_NAME, (join) => {
          join.on(this.col("nNoteTypeId"), MdDocAndNoteType.col("dntId"));
        },
      )
      .join(
        MdUser.TABLE_NAME, (join) => {
          join.on(this.col("nCreatedByUserId"), MdUser.col("uEntityId"));
        },
      )
      .where(this.col("nRecordTypeEntityTypeId"), rtetId)
      .andWhere(this.col("nScope"), nScope);

    return qb;
  }
}
export default new DoNotes();
