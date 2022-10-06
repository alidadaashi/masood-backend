import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdCampaignInstanceFieldRec from "../../../../module/campaign/campSuppInstanceFieldRec/mdCampSuppInstanceFieldRec";
import MdCampaignRecord from "../../../../module/campaign/campaignRecord/mdCampaignRecord";
import MdCampaignField from "../../../../module/campaign/campaignField/mdCampaignField";

const { TABLE_NAME, col } = MdCampaignInstanceFieldRec;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("cifId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("cifCampRecordId", false))
        .references(MdCampaignRecord.col("crId", false)).inTable(MdCampaignRecord.TABLE_NAME);
      table.uuid(col("cifCampFieldId", false))
        .references(MdCampaignField.col("cfId", false)).inTable(MdCampaignField.TABLE_NAME);
      table.string(col("cifValue", false)).nullable();
      table.timestamp(col("cifCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("cifUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.unique([col("cifCampRecordId", false), col("cifCampFieldId", false)]);

      table.index(col("cifCampRecordId", false), undefined, undefined);
      table.index(col("cifCampFieldId", false), undefined, undefined);
      table.index(col("cifValue", false), undefined, undefined);
      table.index(col("cifCreatedAt", false), undefined, undefined);
      table.index(col("cifUpdatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
