import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdDocAndNoteType from "../../../../module/documentAndNotes/docAndNoteType/mdDocAndNoteType";
import MdDocAndNoteTypeInstance from "../../../../module/documentAndNotes/docAndNoteTypeInstance/mdDocAndNoteTypeInstance";
import MdEntity from "../../../../module/entity/mdEntity";

const {
  TABLE_NAME,
  col,
} = MdDocAndNoteTypeInstance;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("dntiId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("dntiDocOrNoteTypeId", false))
        .references(MdDocAndNoteType.col("dntId", false))
        .inTable(MdDocAndNoteType.TABLE_NAME)
        .notNullable();
      table.uuid(col("dntiInstanceId", false))
      .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME).notNullable()
      table.boolean(col("dntiIsForAllCompanies", false)).notNullable();
      table.timestamp(col("dntiCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("dntiUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("dntiDocOrNoteTypeId", false), undefined, undefined);
      table.index(col("dntiInstanceId", false), undefined, undefined);
      table.index(col("dntiIsForAllCompanies", false), undefined, undefined);
      table.index(col("dntiCreatedAt", false), undefined, undefined);
      table.index(col("dntiUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
