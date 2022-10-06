import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdRole from "../../../../module/privilege/role/mdRole";
import { EntityStatusTypesType, tpGetType } from "../../../../module/shared/types/tpShared";

const {
  TABLE_NAME,
  col,
} = MdRole;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("rRoleId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.string(col("rRoleName", false))
        .notNullable();
      table.string(col("rRoleStatus", false))
        .defaultTo(tpGetType<EntityStatusTypesType>("active"));
      table.timestamp(col("rRoleCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("rRoleName", false), undefined, undefined);
      table.index(col("rRoleStatus", false), undefined, undefined);
      table.index(col("rRoleCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
