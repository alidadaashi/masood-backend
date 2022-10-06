import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdPrivilegeOption from "../../../../module/privilege/permission/privilegeOption/mdPrivilegeOption";
import MdPrivilege from "../../../../module/privilege/permission/mdPrivilege";

const {
  TABLE_NAME,
  col,
} = MdPrivilegeOption;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("poId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("poPrivilegeId", false))
        .references(MdPrivilege.col("pId", false))
        .inTable(MdPrivilege.TABLE_NAME)
        .notNullable();
      table.string(col("poOption", false))
        .notNullable();
      table.string(col("poOptionType", false))
        .notNullable();
      table.timestamp(col("poCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("poPrivilegeId", false), undefined, undefined);
      table.index(col("poOption", false), undefined, undefined);
      table.index(col("poOptionType", false), undefined, undefined);
      table.index(col("poCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
