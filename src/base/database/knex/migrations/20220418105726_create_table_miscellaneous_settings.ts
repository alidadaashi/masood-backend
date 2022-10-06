import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdMiscellaneousSettings from "../../../../module/admin/miscellaneousSettings/mdMiscellaneousSettings";
import MdEntity from "../../../../module/entity/mdEntity";

const { TABLE_NAME, col } = MdMiscellaneousSettings;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("msId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("msEntityId", false))
        .references(MdEntity.col("entityId", false)).inTable(MdEntity.TABLE_NAME);
      table.string(col("msType", false));
      table.string(col("msValue", false));
      table.timestamp(col("msCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("msUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("msEntityId", false), undefined, undefined);
      table.index(col("msType", false), undefined, undefined);
      table.index(col("msValue", false), undefined, undefined);
      table.index(col("msCreatedAt", false), undefined, undefined);
      table.index(col("msUpdatedAt", false), undefined, undefined);
    });
}


export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
