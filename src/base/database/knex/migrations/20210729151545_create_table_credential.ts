import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdCredential from "../../../../module/user/credentials/mdCredential";
import MdEntity from "../../../../module/entity/mdEntity";

const {
  TABLE_NAME,
  col,
} = MdCredential;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("cId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("cUserEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table.string(col("cEmail", false))
        .unique()
        .notNullable();
      table.string(col("cPassword", false))
        .notNullable();
      table.timestamp(col("cCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("cUserEntityId", false), undefined, undefined);
      table.index(col("cEmail", false), undefined, undefined);
      table.index(col("cPassword", false), undefined, undefined);
      table.index(col("cCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
