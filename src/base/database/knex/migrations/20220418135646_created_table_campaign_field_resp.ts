import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdCampaignFieldResp from "../../../../module/campaign/campaignFieldResp/mdCampaignFieldResp";
import MdCampaignRecord from "../../../../module/campaign/campaignRecord/mdCampaignRecord";
import MdCampaignFieldDescriptor from "../../../../module/campaign/campaignFieldDescriptor/mdCampaignFieldDescriptor";

const { TABLE_NAME, col } = MdCampaignFieldResp;
export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("cfrId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("cfrCampRecordId", false))
        .references(MdCampaignRecord.col("crId", false)).inTable(MdCampaignRecord.TABLE_NAME);
      table
        .uuid(col("cfrFieldDescriptorId", false))
        .references(MdCampaignFieldDescriptor.col("cfdId", false))
        .inTable(MdCampaignFieldDescriptor.TABLE_NAME);
      table.uuid(col("cfrCampSupplierId", false));
      table.uuid(col("cfrCampInstanceId", false));
      table.string(col("cfrValue", false)).nullable();
      table.string(col("cfrResponseBy", false)).notNullable();
      table.timestamp(col("cfrCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("cfrUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.unique([
        col("cfrCampRecordId", false),
        col("cfrCampSupplierId", false),
        col("cfrCampInstanceId", false),
        col("cfrFieldDescriptorId", false),
        col("cfrResponseBy", false),
      ]);

      table.index(col("cfrCampRecordId", false), undefined, undefined);
      table.index(col("cfrFieldDescriptorId", false), undefined, undefined);
      table.index(col("cfrCampSupplierId", false), undefined, undefined);
      table.index(col("cfrCampInstanceId", false), undefined, undefined);
      table.index(col("cfrValue", false), undefined, undefined);
      table.index(col("cfrResponseBy", false), undefined, undefined);
      table.index(col("cfrCreatedAt", false), undefined, undefined);
      table.index(col("cfrUpdatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
