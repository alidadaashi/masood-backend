import * as Knex from "knex";
import { QueryBuilder } from "knex";
import UserPageLayoutPreferenceModel from "../../../../module/preferences/userPageLayoutPreference/mdUserPageLayoutPreference";
import MdUserPagePreference from "../../../../module/preferences/userPagePreference/mdUserPagePreference";

const {
  TABLE_NAME,
  col,
} = UserPageLayoutPreferenceModel;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("uplpId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.string(col("uplpName", false)).notNullable();
      table
        .uuid(col("uplpPagePreferenceId", false))
        .references(MdUserPagePreference.col("uppId", false))
        .inTable(MdUserPagePreference.TABLE_NAME);
      table.json(col("uplpPreference", false));
      table.timestamps(false, true);

      table.unique([col("uplpPagePreferenceId", false), col("uplpName", false)]);

      table.index(col("uplpName", false), undefined, undefined);
      table.index(col("uplpPagePreferenceId", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
