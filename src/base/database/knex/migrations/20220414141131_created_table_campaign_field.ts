import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdCampaignFieldDescriptor from "../../../../module/campaign/campaignFieldDescriptor/mdCampaignFieldDescriptor";
import MdCampaignField from "../../../../module/campaign/campaignField/mdCampaignField";
import MdCampaign from "../../../../module/campaign/mdCampaign";

const { TABLE_NAME, col } = MdCampaignField;
export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("cfId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table
        .uuid(col("cfCampId", false))
        .references(MdCampaign.col("cId", false))
        .inTable(MdCampaign.TABLE_NAME);
      table
        .uuid(col("cfFieldDescriptorId", false))
        .references(MdCampaignFieldDescriptor.col("cfdId", false))
        .inTable(MdCampaignFieldDescriptor.TABLE_NAME);
      table.boolean(col("cfEditableBySupplier", false));
      table.boolean(col("cfEditableByVendor", false));
      table.timestamp(col("cfCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("cfUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.unique([col("cfCampId", false), col("cfFieldDescriptorId", false)]);

      table.index(col("cfCampId", false), undefined, undefined);
      table.index(col("cfFieldDescriptorId", false), undefined, undefined);
      table.index(col("cfEditableBySupplier", false), undefined, undefined);
      table.index(col("cfEditableByVendor", false), undefined, undefined);
      table.index(col("cfCreatedAt", false), undefined, undefined);
      table.index(col("cfUpdatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
