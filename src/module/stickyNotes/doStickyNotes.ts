import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../base/dao/doBase";
import MdGroupDetails from "../entities/group/mdGroupDetails";
import MdEntityUser from "../entity/entityUser/mdEntityUser";
import { tpSnSlectQueryOptions, tpStickyNotesData } from "../shared/types/tpShared";
import MdUser from "../user/mdUser";
import MdStickyNotes from "./mdStickyNotes";
import MdStickyNoteRef from "./stickyNoteRef/mdStickyNoteRef";
import MdStickyNoteTousersEntity from "./stickyNoteToUsers_entity/mdStickyNoteTousersEntity";

class DoStickyNotes extends DoBase<MdStickyNotes> {
  constructor() {
    super(MdStickyNotes.TABLE_NAME);
  }

  getStickyNotesBaseQueryQb(trx: Transaction): QueryBuilder<tpStickyNotesData[]> {
    const qb = trx(this.tableName);
    qb.select([
      this.col("snId"),
      this.col("snFromUserId"),
      this.col("snSubject"),
      this.col("snBody"),
      this.col("snToMySelf"),
      "snToMySelf as snInoutBound",
      "uFirstName as snFromUserName",
      this.col("snStatus"),
      this.col("snType"),
      this.col("snCreatedAt"),
      MdStickyNoteRef.col("snrRecordTypeEntityTypeId"),
    ]);
    qb.innerJoin(MdUser.TABLE_NAME, (join) => join.on(
      this.col("snFromUserId"), MdUser.col("uEntityId"),
    ));
    qb.fullOuterJoin(MdStickyNoteRef.TABLE_NAME, (join) => join.on(
      this.col("snId"), MdStickyNoteRef.col("snrStickyNoteId"),
    ));
    return qb;
  }

  getAllStickyNotesQueryQb(
    trx: Transaction, isItgAdmin: boolean, userInstances: string[],
  ): QueryBuilder<tpStickyNotesData[]> {
    const qb = this.getStickyNotesBaseQueryQb(trx);

    if (isItgAdmin) return qb;

    qb.innerJoin(MdEntityUser.TABLE_NAME, (join) => join.on(
      MdUser.col("uEntityId"), MdEntityUser.col("euUserEntityId"),
    ));
    qb.innerJoin(MdGroupDetails.TABLE_NAME, (join) => join.on(
      MdEntityUser.col("euEntityId"), MdGroupDetails.col("gEntityId"),
    )).whereIn(MdGroupDetails.col("gEntityId"), userInstances);

    return qb;
  }

  getUsersStickyNotesQb(
    trx: Transaction, options: tpSnSlectQueryOptions,
  ): QueryBuilder<tpStickyNotesData[]> {
    const {
      userId, filterMethod,
    } = options;
    const qb = this.getStickyNotesBaseQueryQb(trx);
    qb.leftJoin(MdStickyNoteTousersEntity.TABLE_NAME, (join) => join.on(
      this.col("snId"), MdStickyNoteTousersEntity.col("sntueStickyNoteId"),
    ));

    if (filterMethod === "archived") {
      qb.orWhere(this.col("snFromUserId"), userId).andWhere(this.col("snStatus"), "archived")
        .orWhere(MdStickyNoteTousersEntity.col("sntueToUserId"), userId)
        .andWhere(this.col("snStatus"), "archived");
    } else if (filterMethod === "read") {
      qb.orWhere(this.col("snFromUserId"), userId)
        .andWhere(this.col("snToMySelf"), true).andWhereNot(this.col("snStatus"), "archived")
        .orWhere(MdStickyNoteTousersEntity.col("sntueToUserId"), userId)
        .andWhereNot(this.col("snStatus"), "archived");
    }

    return qb;
  }
}

export default new DoStickyNotes();
