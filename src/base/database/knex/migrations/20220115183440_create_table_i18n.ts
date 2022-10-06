import * as Knex from "knex";
import MdI18n from "../../../../module/i18n/i18n/mdI18n";

const { TABLE_NAME, col } = MdI18n;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("iId", false)).primary().defaultTo(knex.raw("uuid_generate_v4()")).notNullable();
      table.string(col("iSlug", false)).unique().notNullable();
      table.string(col("iType", false)).notNullable();
      table.timestamp(col("iCreatedAt", false), { useTz: false }).defaultTo(knex.fn.now());

      table.index(col("iSlug", false), undefined, undefined);
      table.index(col("iType", false), undefined, undefined);
      table.index(col("iCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
