import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdUser from "../../../../module/user/mdUser";
import MdEntity from "../../../../module/entity/mdEntity";

const {
  TABLE_NAME,
  col,
} = MdUser;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("uId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("uEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table.string(col("uFirstName", false))
        .notNullable();
      table.string(col("uLastName", false))
        .notNullable();
      table.timestamp(col("uCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("uEntityId", false), undefined, undefined);
      table.index(col("uFirstName", false), undefined, undefined);
      table.index(col("uLastName", false), undefined, undefined);
      table.index(col("uCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
