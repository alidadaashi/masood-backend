import Knex from "knex";
import { QueryBuilder } from "knex";
import MdStickyNotes from "../../../../module/stickyNotes/mdStickyNotes";
import MdStickyNoteTousersEntity from "../../../../module/stickyNotes/stickyNoteToUsers_entity/mdStickyNoteTousersEntity";
import MdEntity from "../../../../module/entity/mdEntity";

const {
  TABLE_NAME,
  col,
} = MdStickyNoteTousersEntity;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("sntueId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
        table.uuid(col("sntueStickyNoteId", false))
        .references(MdStickyNotes.col("snId", false))
        .inTable(MdStickyNotes.TABLE_NAME);
        table.uuid(col("sntueInstanceId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
        table.uuid(col("sntueCompanyId", false));
        table.uuid(col("sntueToUserId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME).notNullable();
        table.timestamp(col("sntueCreatedAt", false), { useTz: false })
          .defaultTo(knex.fn.now());
        table.timestamp(col("sntueUpdatedAt", false), { useTz: false })
          .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

    table.index(col("sntueStickyNoteId", false), undefined, undefined);
    table.index(col("sntueInstanceId", false), undefined, undefined);
    table.index(col("sntueCompanyId", false), undefined, undefined);
    table.index(col("sntueToUserId", false), undefined, undefined);
    table.index(col("sntueCreatedAt", false), undefined, undefined);
    table.index(col("sntueUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
