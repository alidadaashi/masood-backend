import * as Knex from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdI18nInstance from "../../../../module/i18n/i18nInstance/mdI18nInstance";
import MdLanguages from "../../../../module/i18n/languages/mdLanguages";

const { TABLE_NAME, col } = MdI18nInstance;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("iiId", false)).primary().defaultTo(knex.raw("uuid_generate_v4()")).notNullable();
      table.uuid(col("iiInstanceId", false)).references(MdEntity.col("entityId", false)).inTable(MdEntity.TABLE_NAME);
      table.uuid(col("iiLanguageId", false)).references(MdLanguages.col("lId", false)).inTable(MdLanguages.TABLE_NAME);
      table.string(col("iiStatus", false)).notNullable();
      table.timestamp(col("iiCreatedAt", false), { useTz: false }).defaultTo(knex.fn.now());

      table.unique([col("iiInstanceId", false), col("iiLanguageId", false)]);

      table.index(col("iiInstanceId", false), undefined, undefined);
      table.index(col("iiLanguageId", false), undefined, undefined);
      table.index(col("iiStatus", false), undefined, undefined);
      table.index(col("iiCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
