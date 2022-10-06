import * as Knex from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdVendorSupplier from "../../../../vedi/module/vendorSupplier/MdVendorSupplier";

const { TABLE_NAME, col } = MdVendorSupplier;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("vsId", false)).primary().defaultTo(knex.raw("uuid_generate_v4()")).notNullable();
      table.uuid(col("vsSupplierId", false))
        .references(MdEntity.col("entityId", false)).inTable(MdEntity.TABLE_NAME);
      table.uuid(col("vsVendorId", false))
        .references(MdEntity.col("entityId", false)).inTable(MdEntity.TABLE_NAME);
      table.timestamp(col("vsCreatedAt", false), { useTz: false }).defaultTo(knex.fn.now());

      table.index(col("vsSupplierId", false), undefined, undefined);
      table.index(col("vsVendorId", false), undefined, undefined);
      table.index(col("vsCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
