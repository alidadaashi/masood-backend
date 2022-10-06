import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdInstanceDisableDate from "../../../../module/preferences/instanceDisableDate/mdInstanceDisableDate";

const { TABLE_NAME, col } = MdInstanceDisableDate;
export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("iddId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.timestamp(col("iddStartDate", false), { useTz: false });
      table.timestamp(col("iddEndDate", false), { useTz: false });
      table.string(col("iddDescription", false));
      table.boolean(col("iddStatus", false));
      table
        .uuid(col("iddEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table.timestamp(col("iddCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("iddUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("iddStartDate", false), undefined, undefined);
      table.index(col("iddEndDate", false), undefined, undefined);
      table.index(col("iddDescription", false), undefined, undefined);
      table.index(col("iddStatus", false), undefined, undefined);
      table.index(col("iddEntityId", false), undefined, undefined);
      table.index(col("iddCreatedAt", false), undefined, undefined);
      table.index(col("iddUpdatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}


