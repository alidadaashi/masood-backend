import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdEntity from "../../../../module/entity/mdEntity";
import MdCampaign from "../../../../module/campaign/mdCampaign";

const { TABLE_NAME, col } = MdCampaign;
export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("cId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("cEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME)
        .notNullable();
      table.uuid(col("cCreator", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME)
      table.uuid(col("cInstanceId", false)); // todo make relation
      table.string(col("cDescription", false));
      table.string(col("cTextNo", false));
      table.string(col("cText", false));
      table.string(col("cCode", false));
      table.string(col("cErpCode", false));
      table.string(col("cReferenceText", false));
      table.timestamp(col("cStartDate", false), { useTz: false })
      table.timestamp(col("cEndDate", false), { useTz: false })
      table.timestamp(col("cReleaseDate", false), { useTz: false })
      table.timestamp(col("cDeadline", false), { useTz: false })
      table.timestamp(col("cCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("cUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.unique([col("cCode", false), col("cInstanceId", false)]);

      table.index(col("cEntityId", false), undefined, undefined);
      table.index(col("cInstanceId", false), undefined, undefined);
      table.index(col("cCreator", false), undefined, undefined);
      table.index(col("cDescription", false), undefined, undefined);
      table.index(col("cCode", false), undefined, undefined);
      table.index(col("cErpCode", false), undefined, undefined);
      table.index(col("cText", false), undefined, undefined);
      table.index(col("cTextNo", false), undefined, undefined);
      table.index(col("cReferenceText", false), undefined, undefined);
      table.index(col("cStartDate", false), undefined, undefined);
      table.index(col("cEndDate", false), undefined, undefined);
      table.index(col("cReleaseDate", false), undefined, undefined);
      table.index(col("cDeadline", false), undefined, undefined);
      table.index(col("cCreatedAt", false), undefined, undefined);
      table.index(col("cUpdatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<QueryBuilder> {
  return knex.schema.dropTable(TABLE_NAME);
}
