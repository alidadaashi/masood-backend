import * as Knex from "knex";
import { QueryBuilder } from "knex";
import DoCampaignFieldDescriptor from "../../../../module/campaign/campaignFieldDescriptor/doCampaignFieldDescriptor";
import dtCampaignFieldDescriptor from "../../../../module/shared/data/dtCampaignFieldDescriptor";

export async function seed(knex: Knex): Promise<QueryBuilder> {
  return knex.transaction(async (trx) => {
    await DoCampaignFieldDescriptor.insertMany(trx, dtCampaignFieldDescriptor);
  });
}
