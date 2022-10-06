import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import { EntityStatusTypesType, tpGetType } from "../../../../module/shared/types/tpShared";

const {
  TABLE_NAME,
  col,
} = MdEntity;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("entityId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.string(col("entityType", false))
        .notNullable();
      table.string(col("entityStatus", false))
        .defaultTo(tpGetType<EntityStatusTypesType>("active"));
      table.timestamp(col("entityCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("entityType", false), undefined, undefined);
      table.index(col("entityStatus", false), undefined, undefined);
      table.index(col("entityCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
