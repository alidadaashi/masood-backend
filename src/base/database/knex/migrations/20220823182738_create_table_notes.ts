import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdDocAndNoteType from "../../../../module/documentAndNotes/docAndNoteType/mdDocAndNoteType";
import MdRecordTypeEntityType from "../../../../module/shared/module/recordEntities/recordTypeEntityType/mdRecordTypeEntityType";
import MdNotes from "../../../../module/documentAndNotes/notes/note/mdNote";
import MdEntity from "../../../../module/entity/mdEntity";
import { notesStatusList } from "../../../../module/shared/types/tpShared";
import { tpNotesStatus } from "../../../../module/shared/types/tpShared";
import { tpGetType } from "../../../../module/shared/types/tpShared";

const {
  TABLE_NAME,
  col,
} = MdNotes;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("nId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("nNoteTypeId", false))
        .references(MdDocAndNoteType.col("dntId", false))
        .inTable(MdDocAndNoteType.TABLE_NAME)
        .notNullable();
      table.uuid(col("nRecordTypeEntityTypeId", false))
        .references(MdRecordTypeEntityType.col("rtetId", false))
        .inTable(MdRecordTypeEntityType.TABLE_NAME)
        .notNullable();
      table.uuid(col("nCreatedByUserId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME).notNullable();
      table.enu(col("nStatus", false), notesStatusList)
        .defaultTo(tpGetType<tpNotesStatus>("New"));
      table.text(col("nBody", false));
      table.string(col("nScope", false)).nullable();
      table.timestamp(col("nCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("nUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("nNoteTypeId", false), undefined, undefined);
      table.index(col("nBody", false), undefined, undefined);
      table.index(col("nStatus", false), undefined, undefined);
      table.index(col("nScope", false), undefined, undefined);
      table.index(col("nRecordTypeEntityTypeId", false), undefined, undefined);
      table.index(col("nCreatedByUserId", false), undefined, undefined);
      table.index(col("nCreatedAt", false), undefined, undefined);
      table.index(col("nUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
