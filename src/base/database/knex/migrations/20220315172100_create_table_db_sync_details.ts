import * as Knex from "knex";
import MdDbSyncDetails from "../../../../vedi/module/dbSyncDetails/mdDbSyncDetails";

const { TABLE_NAME, col } = MdDbSyncDetails;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.timestamp(col("lastSyncAt", false), { useTz: false }).defaultTo(knex.fn.now());
      table.index(col("lastSyncAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
