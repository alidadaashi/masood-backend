import * as Knex from "knex";
import MdI18nInstanceOverride from "../../../../module/i18n/i18nInstanceOverride/mdI18nInstanceOverride";
import MdEntity from "../../../../module/entity/mdEntity";
import MdI18nTranslations from "../../../../module/i18n/i18nTranslations/mdI18nTranslations";

const { TABLE_NAME, col } = MdI18nInstanceOverride;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("iioId", false)).primary().defaultTo(knex.raw("uuid_generate_v4()")).notNullable();
      table.uuid(col("iioInstanceId", false)).references(MdEntity.col("entityId", false)).inTable(MdEntity.TABLE_NAME);
      table.uuid(col("iioTranslationId", false))
        .references(MdI18nTranslations.col("itId", false)).inTable(MdI18nTranslations.TABLE_NAME);
      table.timestamp(col("iioCreatedAt", false), { useTz: false }).defaultTo(knex.fn.now());

      table.index(col("iioInstanceId", false), undefined, undefined);
      table.index(col("iioTranslationId", false), undefined, undefined);
      table.index(col("iioCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
