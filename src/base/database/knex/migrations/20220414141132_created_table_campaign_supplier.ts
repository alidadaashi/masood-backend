import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdCampaign from "../../../../module/campaign/mdCampaign";
import MdCampaignSupplier from "../../../../module/campaign/campaignSupplier/mdCampaignSupplier";

const { TABLE_NAME, col } = MdCampaignSupplier;
export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("csId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table
        .uuid(col("csCampId", false))
        .references(MdCampaign.col("cId", false))
        .inTable(MdCampaign.TABLE_NAME);
      table.uuid(col("csSupplierId", false)); // todo: add FK reference
      table.string(col("csStatus", false));
      table.timestamp(col("csCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("csUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.unique([col("csCampId", false), col("csSupplierId", false)]);

      table.index(col("csCampId", false), undefined, undefined);
      table.index(col("csSupplierId", false), undefined, undefined);
      table.index(col("csStatus", false), undefined, undefined);
      table.index(col("csCreatedAt", false), undefined, undefined);
      table.index(col("csUpdatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
