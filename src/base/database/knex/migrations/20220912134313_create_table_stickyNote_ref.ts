import Knex from "knex";
import { QueryBuilder } from "knex";
import MdStickyNoteRef from "../../../../module/stickyNotes/stickyNoteRef/mdStickyNoteRef";
import MdStickyNotes from "../../../../module/stickyNotes/mdStickyNotes";
import MdRecordTypeEntityType from "../../../../module/shared/module/recordEntities/recordTypeEntityType/mdRecordTypeEntityType";

const {
  TABLE_NAME,
  col,
} = MdStickyNoteRef;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("snrId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
        table.uuid(col("snrStickyNoteId", false))
        .references(MdStickyNotes.col("snId", false))
        .inTable(MdStickyNotes.TABLE_NAME);
        table.uuid(col("snrRecordTypeEntityTypeId", false))
        .references(MdRecordTypeEntityType.col("rtetId", false))
        .inTable(MdRecordTypeEntityType.TABLE_NAME);
        table.timestamp(col("snrCreatedAt", false), { useTz: false })
          .defaultTo(knex.fn.now());
        table.timestamp(col("snrUpdatedAt", false), { useTz: false })
          .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

        table.index(col("snrStickyNoteId", false), undefined, undefined);
        table.index(col("snrRecordTypeEntityTypeId", false), undefined, undefined);
        table.index(col("snrCreatedAt", false), undefined, undefined);
        table.index(col("snrUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
