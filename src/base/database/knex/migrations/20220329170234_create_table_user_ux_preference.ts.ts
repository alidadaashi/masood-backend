import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdUserUxPreference from "../../../../module/preferences/userUxPreference/mdUserUxPreference";
import MdEntity from "../../../../module/entity/mdEntity";

const { TABLE_NAME, col } = MdUserUxPreference;
export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("uxpId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.string(col("uxpType", false)).notNullable();
      table.json(col("uxpValue", false));
      table
        .uuid(col("uxpUserEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table.timestamps(false, true);

      table.index(col("uxpType", false), undefined, undefined);
      table.index(col("uxpUserEntityId", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
