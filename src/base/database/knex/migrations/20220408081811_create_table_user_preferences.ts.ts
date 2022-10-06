import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdUserPreferences from "../../../../module/preferences/userPreference/mdUserPreferences";
import MdEntity from "../../../../module/entity/mdEntity";

const { TABLE_NAME, col } = MdUserPreferences;
export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("upId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.string(col("upType", false)).notNullable();
      table.string(col("upValue", false));
      table
        .uuid(col("upUserEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table.timestamps(false, true);

      table.index(col("upType", false), undefined, undefined);
      table.index(col("upValue", false), undefined, undefined);
      table.index(col("upUserEntityId", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
