import * as Knex from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdUserSelectedInstance from "../../../../module/user/userSelectedInstance/mdUserSelectedInstance";

const { TABLE_NAME, col } = MdUserSelectedInstance;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("usiId", false)).primary().defaultTo(knex.raw("uuid_generate_v4()")).notNullable();
      table.uuid(col("usiSelectedInstanceEntityId", false))
        .references(MdEntity.col("entityId", false)).inTable(MdEntity.TABLE_NAME);
      table.uuid(col("usiUserEntityId", false))
        .references(MdEntity.col("entityId", false)).inTable(MdEntity.TABLE_NAME);
      table.timestamp(col("usiCreatedAt", false), { useTz: false }).defaultTo(knex.fn.now());

      table.unique([col("usiSelectedInstanceEntityId", false), col("usiUserEntityId", false)]);

      table.index(col("usiSelectedInstanceEntityId", false), undefined, undefined);
      table.index(col("usiUserEntityId", false), undefined, undefined);
      table.index(col("usiCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
