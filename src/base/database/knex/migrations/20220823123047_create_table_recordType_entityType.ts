import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdRecordTypeEntityType from "../../../../module/shared/module/recordEntities/recordTypeEntityType/mdRecordTypeEntityType";
import MdEntityType from "../../../../module/shared/module/recordEntities/entityType/mdEntityType";

const {
  TABLE_NAME,
  col,
} = MdRecordTypeEntityType;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("rtetId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("rtetRecordId", false)).notNullable()
      table.uuid(col("rtetRecordTypeId", false))
        .references(MdEntityType.col("etId", false))
        .inTable(MdEntityType.TABLE_NAME)
        .notNullable();
      table.uuid(col("rtetEntityTypeId", false))
        .references(MdEntityType.col("etId", false))
        .inTable(MdEntityType.TABLE_NAME)
        .notNullable();
      table.timestamp(col("rtetCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("rtetUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("rtetId", false), undefined, undefined);
      table.index(col("rtetRecordId", false), undefined, undefined);
      table.index(col("rtetRecordTypeId", false), undefined, undefined);
      table.index(col("rtetEntityTypeId", false), undefined, undefined);
      table.index(col("rtetUpdatedAt", false), undefined, undefined);
      table.index(col("rtetCreatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
