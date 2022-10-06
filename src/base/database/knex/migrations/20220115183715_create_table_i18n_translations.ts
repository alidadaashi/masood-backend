import * as Knex from "knex";
import MdI18n from "../../../../module/i18n/i18n/mdI18n";
import MdI18nTranslations from "../../../../module/i18n/i18nTranslations/mdI18nTranslations";
import MdLanguages from "../../../../module/i18n/languages/mdLanguages";

const { TABLE_NAME, col } = MdI18nTranslations;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("itId", false)).primary().defaultTo(knex.raw("uuid_generate_v4()")).notNullable();
      table.string(col("itText", false)).nullable();
      table.string(col("itType", false)).notNullable();
      table.string(col("itOverrideType", false)).nullable();
      table.uuid(col("itLangId", false)).references(MdLanguages.col("lId", false)).inTable(MdLanguages.TABLE_NAME);
      table.uuid(col("itI18nId", false)).references(MdI18n.col("iId", false)).inTable(MdI18n.TABLE_NAME);
      table.timestamp(col("itCreatedAt", false), { useTz: false }).defaultTo(knex.fn.now());

      table.index(col("itText", false), undefined, undefined);
      table.index(col("itType", false), undefined, undefined);
      table.index(col("itOverrideType", false), undefined, undefined);
      table.index(col("itLangId", false), undefined, undefined);
      table.index(col("itI18nId", false), undefined, undefined);
      table.index(col("itCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
