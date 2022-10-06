import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdDocAndNoteType from "../../../../module/documentAndNotes/docAndNoteType/mdDocAndNoteType";
import MdDocAndNoteTypeUser from "../../../../module/documentAndNotes/docAndNoteTypeUser/mdDocAndNoteTypeUser";

const {
  TABLE_NAME,
  col,
} = MdDocAndNoteTypeUser;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("dntuId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("dntuDocOrNoteTypeId", false))
        .references(MdDocAndNoteType.col("dntId", false))
        .inTable(MdDocAndNoteType.TABLE_NAME)
        .notNullable();
      table.uuid(col("dntuCreatedByUserId", false))
      .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME).notNullable();
      table.timestamp(col("dntuCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("dntuUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("dntuDocOrNoteTypeId", false), undefined, undefined);
      table.index(col("dntuCreatedByUserId", false), undefined, undefined);
      table.index(col("dntuCreatedAt", false), undefined, undefined);
      table.index(col("dntuUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
