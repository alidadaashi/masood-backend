import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdCompanyDetails from "../../../../module/entities/company/mdCompanyDetails";

const {
  TABLE_NAME,
  col,
} = MdCompanyDetails;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("cId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("cEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME)
        .notNullable();
      table.uuid(col("cInstanceEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME)
        .notNullable();
      table.string(col("cName", false))
        .notNullable();
      table.timestamp(col("cCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("cUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table.index(col("cId", false), undefined, undefined);
      table.index(col("cEntityId", false), undefined, undefined);
      table.index(col("cInstanceEntityId", false), undefined, undefined);
      table.index(col("cName", false), undefined, undefined);
      table.index(col("cCreatedAt", false), undefined, undefined);
      table.index(col("cUpdatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
