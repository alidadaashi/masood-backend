import * as Knex from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdI18nTranslations from "../../../../module/i18n/i18nTranslations/mdI18nTranslations";
import MdI18nDynamic from "../../../../module/i18n/i18nDynamic/mdI18nDynamic";

const { TABLE_NAME, col } = MdI18nDynamic;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("idId", false)).primary().defaultTo(knex.raw("uuid_generate_v4()")).notNullable();
      table.uuid(col("idInstanceId", false)).references(MdEntity.col("entityId", false)).inTable(MdEntity.TABLE_NAME);
      table.uuid(col("idItemId", false)).notNullable();
      table.uuid(col("idTranslationId", false))
        .references(MdI18nTranslations.col("itId", false)).inTable(MdI18nTranslations.TABLE_NAME);
      table.string(col("idItemType", false)).notNullable();
      table.timestamp(col("idCreatedAt", false), { useTz: false }).defaultTo(knex.fn.now());

      table.index(col("idInstanceId", false), undefined, undefined);
      table.index(col("idItemId", false), undefined, undefined);
      table.index(col("idTranslationId", false), undefined, undefined);
      table.index(col("idItemType", false), undefined, undefined);
      table.index(col("idCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
