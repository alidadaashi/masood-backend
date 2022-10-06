import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdAttachmentDescription from "../../../../module/documentAndNotes/document/attachmentDescription/mdAttachmentDescription";
import MdAttachment from "../../../../module/documentAndNotes/document/attachment/mdAttachment";

const {
  TABLE_NAME,
  col,
} = MdAttachmentDescription;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("adId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("adAttachmentId", false))
        .references(MdAttachment.col("aId", false))
        .inTable(MdAttachment.TABLE_NAME)
        .notNullable();
      table.text(col("adDescription", false));
      table.timestamp(col("adCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("adUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("adAttachmentId", false), undefined, undefined);
      table.index(col("adDescription", false), undefined, undefined);
      table.index(col("adCreatedAt", false), undefined, undefined);
      table.index(col("adUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
