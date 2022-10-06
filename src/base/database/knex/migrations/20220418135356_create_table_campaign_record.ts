import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdCampaignRecord from "../../../../module/campaign/campaignRecord/mdCampaignRecord";
import MdCampaign from "../../../../module/campaign/mdCampaign";

const { TABLE_NAME, col } = MdCampaignRecord;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("crId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("crCampId", false))
        .references(MdCampaign.col("cId", false)).inTable(MdCampaign.TABLE_NAME);
      table.timestamp(col("crCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("crUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("crCampId", false), undefined, undefined);
      table.index(col("crCreatedAt", false), undefined, undefined);
      table.index(col("crUpdatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
