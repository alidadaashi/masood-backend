import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdCampaignFieldDescriptor from "../../../../module/campaign/campaignFieldDescriptor/mdCampaignFieldDescriptor";

const { TABLE_NAME, col } = MdCampaignFieldDescriptor;
export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("cfdId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.string(col("cfdSlug", false));
      table.string(col("cfdAcceptableRespType", false));
      table.string(col("cfdName", false)).unique();
      table.timestamp(col("cfdCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("cfdUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("cfdSlug", false), undefined, undefined);
      table.index(col("cfdAcceptableRespType", false), undefined, undefined);
      table.index(col("cfdName", false), undefined, undefined);
      table.index(col("cfdCreatedAt", false), undefined, undefined);
      table.index(col("cfdUpdatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
