import * as Knex from "knex";
import { QueryBuilder } from "knex";
import mdAppNotifications from "../../../../module/appNotifications/mdAppNotifications";

const { TABLE_NAME, col } = mdAppNotifications;
export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("anId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.string(col("anSenderId", false));
      table.string(col("anReceiverId", false));
      table.string(col("anTitle", false));
      table.text(col("anDescription", false));
      table.boolean(col("anMarkAsView", false));
      table.string(col("anSeverity", false));
      table.timestamp(col("anCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("anUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("anSenderId", false), undefined, undefined);
      table.index(col("anReceiverId", false), undefined, undefined);
      table.index(col("anTitle", false), undefined, undefined);
      table.index(col("anDescription", false), undefined, undefined);
      table.index(col("anMarkAsView", false), undefined, undefined);
      table.index(col("anSeverity", false), undefined, undefined);
      table.index(col("anCreatedAt", false), undefined, undefined);
      table.index(col("anUpdatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}


