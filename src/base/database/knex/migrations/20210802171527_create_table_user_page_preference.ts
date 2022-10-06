import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdUserPagePreference from "../../../../module/preferences/userPagePreference/mdUserPagePreference";

const {
  TABLE_NAME,
  col,
} = MdUserPagePreference;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("uppId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table
        .uuid(col("uppEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table.string(col("uppKey", false)).notNullable().unique();
      table
        .uuid(col("uppFavoriteLayoutId", false));
      table
        .uuid(col("uppFavoriteQueryId", false));
      table.timestamps(false, true);
      table.index(col("uppEntityId", false), undefined, undefined);
      table.index(col("uppFavoriteLayoutId", false), undefined, undefined);
      table.index(col("uppFavoriteQueryId", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
