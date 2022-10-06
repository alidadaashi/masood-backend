import * as Knex from "knex";
import MdPages from "../../../../module/pages/mdPages";
import ModuleModel from "../../../../module/privilege/module/mdModule";

const {
  TABLE_NAME,
  col,
} = MdPages;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("pgId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table
        .uuid(col("pgModuleId", false))
        .references(ModuleModel.col("mModuleId", false))
        .inTable(ModuleModel.TABLE_NAME);
      table
        .string(col("pgName", false));
      table.unique([col("pgModuleId", false), col("pgName", false)]);
      table.timestamp(col("pgCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("pgModuleId", false), undefined, undefined);
      table.index(col("pgName", false), undefined, undefined);
      table.index(col("pgCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
