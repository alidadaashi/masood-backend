import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdDocAndNoteType from "../../../../module/documentAndNotes/docAndNoteType/mdDocAndNoteType";
import MdDocAndNoteTypeCompany from "../../../../module/documentAndNotes/docAndNoteTypeCompany/mdDocAndNoteTypeCompany";
import MdEntity from "../../../../module/entity/mdEntity";

const {
  TABLE_NAME,
  col,
} = MdDocAndNoteTypeCompany;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("dntcId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("dntcDocOrNoteTypeId", false))
        .references(MdDocAndNoteType.col("dntId", false))
        .inTable(MdDocAndNoteType.TABLE_NAME)
        .notNullable();
      table.uuid(col("dntcCompanyId", false))
      .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME).notNullable()
      table.timestamp(col("dntcCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("dntcUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("dntcDocOrNoteTypeId", false), undefined, undefined);
      table.index(col("dntcCompanyId", false), undefined, undefined);
      table.index(col("dntcCreatedAt", false), undefined, undefined);
      table.index(col("dntcUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
