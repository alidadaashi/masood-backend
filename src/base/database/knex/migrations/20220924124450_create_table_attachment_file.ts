import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdAttachmentFile from "../../../../module/documentAndNotes/document/attachmentFile/mdAttachmentFile";
import MdAttachment from "../../../../module/documentAndNotes/document/attachment/mdAttachment";
import MdFiles from "../../../../module/shared/module/files/mdFile";

const {
  TABLE_NAME,
  col,
} = MdAttachmentFile;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("afId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("afAttachmentId", false))
        .references(MdAttachment.col("aId", false))
        .inTable(MdAttachment.TABLE_NAME)
        .notNullable();
      table.uuid(col("afFileId", false))
        .references(MdFiles.col("fId", false))
        .inTable(MdFiles.TABLE_NAME)
        .notNullable();
      table.timestamp(col("afCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("afUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("afAttachmentId", false), undefined, undefined);
      table.index(col("afFileId", false), undefined, undefined);
      table.index(col("afCreatedAt", false), undefined, undefined);
      table.index(col("afUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}