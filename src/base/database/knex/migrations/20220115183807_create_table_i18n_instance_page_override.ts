import * as Knex from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdI18nTranslations from "../../../../module/i18n/i18nTranslations/mdI18nTranslations";
import MdI18nPageOverride from "../../../../module/i18n/i18nPageOverride/mdI18nPageOverride";
import MdPages from "../../../../module/pages/mdPages";

const { TABLE_NAME, col } = MdI18nPageOverride;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("ipoId", false)).primary().defaultTo(knex.raw("uuid_generate_v4()")).notNullable();
      table.uuid(col("ipoInstanceId", false)).references(MdEntity.col("entityId", false)).inTable(MdEntity.TABLE_NAME);
      table.uuid(col("ipoPageId", false)).references(MdPages.col("pgId", false)).inTable(MdPages.TABLE_NAME);
      table.uuid(col("ipoTranslationId", false))
        .references(MdI18nTranslations.col("itId", false)).inTable(MdI18nTranslations.TABLE_NAME);
      table.timestamp(col("ipoCreatedAt", false), { useTz: false }).defaultTo(knex.fn.now());

      table.unique([col("ipoInstanceId", false), col("ipoPageId", false),
        col("ipoTranslationId", false)]);

      table.index(col("ipoInstanceId", false), undefined, undefined);
      table.index(col("ipoPageId", false), undefined, undefined);
      table.index(col("ipoTranslationId", false), undefined, undefined);
      table.index(col("ipoCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
