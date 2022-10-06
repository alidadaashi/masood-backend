import * as Knex from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdPrivilegeUserEntity from "../../../../module/privilege/privilegeDisplayUserEntity/mdPrivilegeUserEntity";

const {
  TABLE_NAME,
  col,
} = MdPrivilegeUserEntity;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("pueId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table
        .uuid(col("pueUserEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table
        .uuid(col("pueEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table.string(col("pueEntityType", false))
        .notNullable();
      table.timestamp(col("pueCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("pueUserEntityId", false), undefined, undefined);
      table.index(col("pueEntityId", false), undefined, undefined);
      table.index(col("pueEntityType", false), undefined, undefined);
      table.index(col("pueCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
