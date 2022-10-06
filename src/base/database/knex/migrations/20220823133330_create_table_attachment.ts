import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdRecordTypeEntityType from "../../../../module/shared/module/recordEntities/recordTypeEntityType/mdRecordTypeEntityType";
import MdEntity from "../../../../../src/module/entity/mdEntity";
import MdDocAndNoteType from "../../../../module/documentAndNotes/docAndNoteType/mdDocAndNoteType";
import MdAttachment from "../../../../module/documentAndNotes/document/attachment/mdAttachment";

const {
  TABLE_NAME,
  col,
} = MdAttachment;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("aId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.uuid(col("aDocTypeId", false))
        .references(MdDocAndNoteType.col("dntId", false))
        .inTable(MdDocAndNoteType.TABLE_NAME)
        .notNullable();
      table.uuid(col("aCreatedByUserId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME).notNullable();
      table.uuid(col("aRecordTypeEntityTypeId", false))
        .references(MdRecordTypeEntityType.col("rtetId", false))
        .inTable(MdRecordTypeEntityType.TABLE_NAME)
        .notNullable();
      table.string(col("aScope", false)).nullable();
      table.timestamp(col("aCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("aUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("aCreatedByUserId", false), undefined, undefined);
      table.index(col("aScope", false), undefined, undefined);
      table.index(col("aRecordTypeEntityTypeId", false), undefined, undefined);
      table.index(col("aCreatedAt", false), undefined, undefined);
      table.index(col("aUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
