import * as Knex from "knex";
import { QueryBuilder } from "knex";
import ModuleModel from "../../../../module/privilege/module/mdModule";
import { EntityStatusTypesList, EntityStatusTypesType, tpGetType } from "../../../../module/shared/types/tpShared";

const {
  TABLE_NAME,
  col,
} = ModuleModel;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .raw(`
      DROP TYPE IF EXISTS node_pos;
      CREATE TYPE node_pos as (node text);
    `)
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("mModuleId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("mModuleParentId", false))
        .references(ModuleModel.col("mModuleId", false))
        .inTable(ModuleModel.TABLE_NAME);
      table.string(col("mModuleName", false))
        .notNullable()
        .unique();
      table.enu(col("mModuleStatus", false), EntityStatusTypesList)
        .defaultTo(tpGetType<EntityStatusTypesType>("active"));
      table.string(col("mModuleType", false))
        .notNullable();
      table.timestamp(col("mModuleCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("mModuleParentId", false), undefined, undefined);
      table.index(col("mModuleName", false), undefined, undefined);
      table.index(col("mModuleStatus", false), undefined, undefined);
      table.index(col("mModuleType", false), undefined, undefined);
      table.index(col("mModuleCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
