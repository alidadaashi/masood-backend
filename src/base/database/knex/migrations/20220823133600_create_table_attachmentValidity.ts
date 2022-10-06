import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdAttachmentValidity from "../../../../module/documentAndNotes/document/attachmentValidity/mdAttachmentValidity";
import MdAttachment from "../../../../module/documentAndNotes/document/attachment/mdAttachment";

const {
  TABLE_NAME,
  col,
} = MdAttachmentValidity;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("avId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("avAttachmentId", false))
        .references(MdAttachment.col("aId", false))
        .inTable(MdAttachment.TABLE_NAME)
        .notNullable();
      table.timestamp(col("avValidityStartDate", false), { useTz: false });
      table.timestamp(col("avValidityEndDate", false), { useTz: false });
      table.timestamp(col("avCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("avUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("avAttachmentId", false), undefined, undefined);
      table.index(col("avValidityStartDate", false), undefined, undefined);
      table.index(col("avValidityEndDate", false), undefined, undefined);
      table.index(col("avCreatedAt", false), undefined, undefined);
      table.index(col("avUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
