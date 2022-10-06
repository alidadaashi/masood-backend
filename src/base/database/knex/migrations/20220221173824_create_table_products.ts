import * as Knex from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdProduct from "../../../../module/product/mdProduct";

const { TABLE_NAME, col } = MdProduct;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("pId", false)).primary().defaultTo(knex.raw("uuid_generate_v4()")).notNullable();
      table.uuid(col("pInstanceId", false)).references(MdEntity.col("entityId", false)).inTable(MdEntity.TABLE_NAME);
      table.integer(col("pPrice", false)).notNullable();
      table.timestamp(col("pCreatedAt", false), { useTz: false }).defaultTo(knex.fn.now());

      table.index(col("pInstanceId", false), undefined, undefined);
      table.index(col("pPrice", false), undefined, undefined);
      table.index(col("pCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
