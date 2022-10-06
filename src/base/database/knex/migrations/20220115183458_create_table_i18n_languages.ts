import * as Knex from "knex";
import MdLanguages from "../../../../module/i18n/languages/mdLanguages";
import { tpGetType } from "../../../../module/shared/types/tpShared";

const { TABLE_NAME, col } = MdLanguages;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("lId", false)).primary().defaultTo(knex.raw("uuid_generate_v4()")).notNullable();
      table.string(col("lShortName", false)).notNullable().unique();
      table.string(col("lFullName", false)).notNullable();
      table.string(col("lStatus", false)).defaultTo(tpGetType<MdLanguages["lStatus"]>("active"));
      table.timestamp(col("lCreatedAt", false), { useTz: false }).defaultTo(knex.fn.now());

      table.index(col("lShortName", false), undefined, undefined);
      table.index(col("lFullName", false), undefined, undefined);
      table.index(col("lStatus", false), undefined, undefined);
      table.index(col("lCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
