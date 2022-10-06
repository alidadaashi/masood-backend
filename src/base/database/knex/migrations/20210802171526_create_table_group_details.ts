import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdGroupDetails from "../../../../module/entities/group/mdGroupDetails";

const {
  TABLE_NAME,
  col,
} = MdGroupDetails;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("gId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("gEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME)
        .notNullable();
      table.uuid(col("gDomainEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME)
        .notNullable();
      table.string(col("gName", false))
        .notNullable();
      table.string(col("refSpId", false)).nullable();
      table.timestamp(col("gCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("gUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table.index(col("gEntityId", false), undefined, undefined);
      table.index(col("gDomainEntityId", false), undefined, undefined);
      table.index(col("gName", false), undefined, undefined);
      table.index(col("refSpId", false), undefined, undefined);
      table.index(col("gCreatedAt", false), undefined, undefined);
      table.index(col("gUpdatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
