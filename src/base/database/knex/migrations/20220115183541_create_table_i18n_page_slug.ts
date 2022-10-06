import * as Knex from "knex";
import MdI18nPageSlug from "../../../../module/i18n/i18nPageSlug/mdI18nPageSlug";
import MdPages from "../../../../module/pages/mdPages";
import MdI18n from "../../../../module/i18n/i18n/mdI18n";

const { TABLE_NAME, col } = MdI18nPageSlug;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("ipsId", false)).primary().defaultTo(knex.raw("uuid_generate_v4()")).notNullable();
      table.uuid(col("ipsPageId", false)).references(MdPages.col("pgId", false)).inTable(MdPages.TABLE_NAME);
      table.uuid(col("ipsSlugId", false)).references(MdI18n.col("iId", false)).inTable(MdI18n.TABLE_NAME);
      table.timestamp(col("ipsCreatedAt", false), { useTz: false }).defaultTo(knex.fn.now());
      table.unique([col("ipsPageId", false), col("ipsSlugId", false)]);

      table.index(col("ipsPageId", false), undefined, undefined);
      table.index(col("ipsSlugId", false), undefined, undefined);
      table.index(col("ipsCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
