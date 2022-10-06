import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdLogs from "../../../../module/appLogs/mdLogs";

const { TABLE_NAME, col } = MdLogs;
export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("lId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.string(col("lDoerId", false));
      table.string(col("lAffecteeId", false));
      table.string(col("lActivity", false));
      table.string(col("lEntity", false));
      table.string(col("lStatus", false));
      table.timestamp(col("lCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("lUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("lDoerId", false), undefined, undefined);
      table.index(col("lAffecteeId", false), undefined, undefined);
      table.index(col("lActivity", false), undefined, undefined);
      table.index(col("lEntity", false), undefined, undefined);
      table.index(col("lStatus", false), undefined, undefined);
      table.index(col("lCreatedAt", false), undefined, undefined);
      table.index(col("lUpdatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}


