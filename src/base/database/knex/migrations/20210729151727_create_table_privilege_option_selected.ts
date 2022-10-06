import * as Knex from "knex";
import { QueryBuilder } from "knex";
import PrivilegeOptionSelectedModel
  from "../../../../module/privilege/permission/privilegeOptionSelected/mdPrivilegeOptionSelected";
import MdPrivilegeOption from "../../../../module/privilege/permission/privilegeOption/mdPrivilegeOption";
import MdRolePrivilege from "../../../../module/privilege/role/rolePrivilege/mdRolePrivilege";

const {
  TABLE_NAME,
  col,
} = PrivilegeOptionSelectedModel;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("posId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("posRolePrivilegeId", false))
        .references(MdRolePrivilege.col("rpId", false))
        .inTable(MdRolePrivilege.TABLE_NAME)
        .notNullable();
      table.uuid(col("posPrivilegeOptionId", false))
        .references(MdPrivilegeOption.col("poId", false))
        .inTable(MdPrivilegeOption.TABLE_NAME);
      table.timestamp(col("posCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("posRolePrivilegeId", false), undefined, undefined);
      table.index(col("posPrivilegeOptionId", false), undefined, undefined);
      table.index(col("posCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
