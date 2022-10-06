import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdProfile from "../../../../module/privilege/profile/mdProfile";
import { EntityStatusTypesType, tpGetType } from "../../../../module/shared/types/tpShared";

const {
  TABLE_NAME,
  col,
} = MdProfile;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("pProfileId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.string(col("pProfileName", false))
        .notNullable();
      table.string(col("pProfileStatus", false))
        .defaultTo(tpGetType<EntityStatusTypesType>("active"));
      table.timestamp(col("pProfileCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("pProfileName", false), undefined, undefined);
      table.index(col("pProfileStatus", false), undefined, undefined);
      table.index(col("pProfileCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
