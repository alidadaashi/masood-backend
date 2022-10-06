import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdRolePrivilege from "../../../../module/privilege/role/rolePrivilege/mdRolePrivilege";
import MdPrivilege from "../../../../module/privilege/permission/mdPrivilege";
import MdRole from "../../../../module/privilege/role/mdRole";

const {
  TABLE_NAME,
  col,
} = MdRolePrivilege;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("rpId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("rpPrivilegeId", false))
        .references(MdPrivilege.col("pId", false))
        .inTable(MdPrivilege.TABLE_NAME)
        .nullable();
      table.uuid(col("rpRoleId", false))
        .references(MdRole.col("rRoleId", false))
        .inTable(MdRole.TABLE_NAME)
        .nullable();
      table.timestamp(col("rpCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("rpPrivilegeId", false), undefined, undefined);
      table.index(col("rpRoleId", false), undefined, undefined);
      table.index(col("rpCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
