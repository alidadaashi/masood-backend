import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdProfile from "../../../../module/privilege/profile/mdProfile";
import ProfileRoleModel from "../../../../module/privilege/profile/profileRole/mdProfileRole";
import MdRole from "../../../../module/privilege/role/mdRole";
import { EntityStatusTypesType, tpGetType } from "../../../../module/shared/types/tpShared";

const {
  TABLE_NAME,
  col,
} = ProfileRoleModel;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("prId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("prProfileId", false))
        .references(MdProfile.col("pProfileId", false))
        .inTable(MdProfile.TABLE_NAME)
        .notNullable();
      table.uuid(col("prRoleId", false))
        .references(MdRole.col("rRoleId", false))
        .inTable(MdRole.TABLE_NAME)
        .notNullable();
      table.string(col("prStatus", false))
        .defaultTo(tpGetType<EntityStatusTypesType>("active"));
      table.timestamp(col("prCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("prProfileId", false), undefined, undefined);
      table.index(col("prRoleId", false), undefined, undefined);
      table.index(col("prStatus", false), undefined, undefined);
      table.index(col("prCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
