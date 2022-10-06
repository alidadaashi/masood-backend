import * as Knex from "knex";
import { QueryBuilder } from "knex";
import MdDocAndNoteType from "../../../../module/documentAndNotes/docAndNoteType/mdDocAndNoteType";

const {
  TABLE_NAME,
  col,
} = MdDocAndNoteType;

export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table.uuid(col("dntId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table.string(col("dntName", false)).notNullable();
      table.string(col("dntType", false)).notNullable();
      table.string(col("dntDefinedType", false)).notNullable();
      table.string(col("dntHierarchyType", false)).notNullable();
      table.boolean(col("dntIsActive", false)).notNullable();
      table.boolean(col("dntIsValidityRequired", false));
      table.boolean(col("dntIsPrivNeeded", false));
      table.uuid(col("dntParentTypeId", false)).nullable();
      table.timestamp(col("dntCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.timestamp(col("dntUpdatedAt", false), { useTz: false })
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table.index(col("dntName", false), undefined, undefined);
      table.index(col("dntType", false), undefined, undefined);
      table.index(col("dntDefinedType", false), undefined, undefined);
      table.index(col("dntHierarchyType", false), undefined, undefined);
      table.index(col("dntIsActive", false), undefined, undefined);
      table.index(col("dntIsValidityRequired", false), undefined, undefined);
      table.index(col("dntIsPrivNeeded", false), undefined, undefined);
      table.index(col("dntParentTypeId", false), undefined, undefined);
      table.index(col("dntCreatedAt", false), undefined, undefined);
      table.index(col("dntUpdatedAt", false), undefined, undefined);
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
}
