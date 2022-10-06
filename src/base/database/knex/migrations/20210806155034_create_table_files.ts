import * as Knex from "knex";
import MdFiles from "../../../../module/shared/module/files/mdFile";
import MdEntity from "../../../../module/entity/mdEntity";
import { TypeList } from "../../../../module/shared/types/tpShared";

const {
  TABLE_NAME,
  col,
} = MdFiles;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("fId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table
        .string(col("fName", false));
      table
        .enu(col("fType", false), TypeList);
      table
        .string(col("fPath", false));
      table
        .decimal(col("fSizeBytes", false));
      table
        .string(col("fExtension", false));
      table
        .uuid(col("fEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table.timestamp(col("fCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("fName", false), undefined, undefined);
      table.index(col("fType", false), undefined, undefined);
      table.index(col("fPath", false), undefined, undefined);
      table.index(col("fSizeBytes", false), undefined, undefined);
      table.index(col("fExtension", false), undefined, undefined);
      table.index(col("fEntityId", false), undefined, undefined);
      table.index(col("fCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
