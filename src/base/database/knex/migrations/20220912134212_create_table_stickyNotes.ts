import Knex from "knex";
import { QueryBuilder } from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import { StickyNotesStatusList } from "../../../../module/shared/types/tpShared";
import { StickyNotesCategoryList } from "../../../../module/shared/types/tpShared";
import MdStickyNotes from "../../../../module/stickyNotes/mdStickyNotes";

const {
  TABLE_NAME,
  col,
} = MdStickyNotes;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("snId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("snFromUserId", false))
      .references(MdEntity.col("entityId", false))
      .inTable(MdEntity.TABLE_NAME).notNullable();
      table.text(col("snBody", false));
      table.string(col("snSubject", false));
      table.boolean(col("snSendAsEmail", false));
      table.boolean(col("snToMySelf", false));
      table.enum(col("snType", false), StickyNotesCategoryList);
      table.enum(col("snStatus", false), StickyNotesStatusList);
      table.timestamp(col("snCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("snUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("snFromUserId", false), undefined, undefined);
      table.index(col("snBody", false), undefined, undefined);
      table.index(col("snSubject", false), undefined, undefined);
      table.index(col("snSendAsEmail", false), undefined, undefined);
      table.index(col("snToMySelf", false), undefined, undefined);
      table.index(col("snType", false), undefined, undefined);
      table.index(col("snStatus", false), undefined, undefined);
      table.index(col("snCreatedAt", false), undefined, undefined);
      table.index(col("snUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
