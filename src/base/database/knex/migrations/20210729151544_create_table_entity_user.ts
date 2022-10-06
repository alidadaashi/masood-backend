import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdEntityUser from "../../../../module/entity/entityUser/mdEntityUser";
import MdEntity from "../../../../module/entity/mdEntity";

const {
  TABLE_NAME,
  col,
} = MdEntityUser;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("euId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("euEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME)
        .notNullable();
      table.uuid(col("euUserEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME)
        .notNullable();
      table.string(col("refId", false)).nullable();
      table.timestamp(col("euCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("euEntityId", false), undefined, undefined);
      table.index(col("euUserEntityId", false), undefined, undefined);
      table.index(col("refId", false), undefined, undefined);
      table.index(col("euCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
