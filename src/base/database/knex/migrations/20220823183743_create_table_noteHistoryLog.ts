import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdNoteHistoryLog from "../../../../module/documentAndNotes/notes/noteHistoryLog/mdNoteHistoryLog";
import MdNotes from "../../../../module/documentAndNotes/notes/note/mdNote";

const {
  TABLE_NAME,
  col,
} = MdNoteHistoryLog;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("nhlId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("nhlNoteId", false))
        .references(MdNotes.col("nId", false))
        .inTable(MdNotes.TABLE_NAME)
        .notNullable();
      table.string(col("nhlRevisionId", false)).notNullable();
      table.timestamp(col("nhlCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("nhlUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("nhlNoteId", false), undefined, undefined);
      table.index(col("nhlRevisionId", false), undefined, undefined);
      table.index(col("nhlCreatedAt", false), undefined, undefined);
      table.index(col("nhlUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
