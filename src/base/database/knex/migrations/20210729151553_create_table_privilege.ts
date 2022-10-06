import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdPrivilege from "../../../../module/privilege/permission/mdPrivilege";
import ModuleModel from "../../../../module/privilege/module/mdModule";

const {
  TABLE_NAME,
  col,
} = MdPrivilege;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("pId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("pModuleId", false))
        .references(ModuleModel.col("mModuleId", false))
        .inTable(ModuleModel.TABLE_NAME)
        .notNullable();
      table.string(col("pPrivilege", false))
        .notNullable();
      table.timestamp(col("pCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());

      table.unique([
        col("pModuleId", false),
        col("pPrivilege", false),
      ]);
      table.index(col("pModuleId", false), undefined, undefined);
      table.index(col("pPrivilege", false), undefined, undefined);
      table.index(col("pCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
