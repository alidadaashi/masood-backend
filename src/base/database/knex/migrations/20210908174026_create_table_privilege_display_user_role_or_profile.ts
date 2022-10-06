import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import PrivilegeUserRoleOrProfileModel
  from "../../../../module/privilege/privilegeDisplayUserRoleOrProfile/mdPrivilegeUserRoleOrProfile";

const {
  TABLE_NAME,
  col,
} = PrivilegeUserRoleOrProfileModel;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("purpId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table
        .uuid(col("purpUserEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table.uuid(col("purpProfileOrRoleId", false));
      table.string(col("purpPrivilegeType", false))
        .notNullable();
      table.timestamp(col("purpCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("purpUserEntityId", false), undefined, undefined);
      table.index(col("purpProfileOrRoleId", false), undefined, undefined);
      table.index(col("purpPrivilegeType", false), undefined, undefined);
      table.index(col("purpCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
