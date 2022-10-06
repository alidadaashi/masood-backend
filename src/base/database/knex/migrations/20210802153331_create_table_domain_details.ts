import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdDomainDetails from "../../../../module/entities/domain/mdDomainDetails";
import MdEntity from "../../../../module/entity/mdEntity";

const {
  TABLE_NAME,
  col,
} = MdDomainDetails;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("dId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("dEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME)
        .notNullable();
      table.string(col("dName", false))
        .notNullable();
      table.timestamp(col("dCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("dEntityId", false), undefined, undefined);
      table.index(col("dName", false), undefined, undefined);
      table.index(col("dCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
