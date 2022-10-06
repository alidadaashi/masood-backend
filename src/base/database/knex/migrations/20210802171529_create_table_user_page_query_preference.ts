import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdUserPageQueryPreference
  from "../../../../module/preferences/userPageQueryPreference/mdUserPageQueryPreference";
import MdUserPagePreference from "../../../../module/preferences/userPagePreference/mdUserPagePreference";

const {
  TABLE_NAME,
  col,
} = MdUserPageQueryPreference;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("upqpId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.string(col("upqpName", false)).notNullable();
      table
        .uuid(col("upqpPagePreferenceId", false))
        .references(MdUserPagePreference.col("uppId", false))
        .inTable(MdUserPagePreference.TABLE_NAME);
      table.json(col("upqpPreference", false));
      table.timestamps(false, true);
      table.unique([col("upqpPagePreferenceId", false), col("upqpName", false)]);

      table.index(col("upqpName", false), undefined, undefined);
      table.index(col("upqpPagePreferenceId", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
