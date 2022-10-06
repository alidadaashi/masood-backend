import * as Knex from "knex";
import { QueryBuilder } from "knex";
import { entityTypeNamesList } from "../../../../module/shared/types/tpShared";
import MdEntityType from "../../../../module/shared/module/recordEntities/entityType/mdEntityType";

const {
  TABLE_NAME,
  col,
} = MdEntityType;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("etId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.enu(col("etName", false), entityTypeNamesList);
      table.timestamp(col("etCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("etUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("etId", false), undefined, undefined);
      table.index(col("etName", false), undefined, undefined);
      table.index(col("etUpdatedAt", false), undefined, undefined);
      table.index(col("etCreatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
