import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdCampaignUserToken from "../.../../../../../../src/module/campaign/campaignUserToken/mdCampaignUserToken";

const {
  TABLE_NAME,
  col,
} = MdCampaignUserToken;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("cutId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("cutEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table.string(col("cutToken", false))
			.defaultTo(knex.raw("uuid_generate_v4()"))
			.notNullable();
      table.timestamp(col("cutExpiry", false), { useTz: false })
        .notNullable();
      table.timestamp(col("cutCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());

      table.index(col("cutEntityId", false), undefined, undefined);
      table.index(col("cutToken", false), undefined, undefined);
      table.index(col("cutExpiry", false), undefined, undefined);
      table.index(col("cutCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
