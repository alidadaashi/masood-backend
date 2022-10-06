import * as Knex from "knex";
import MdCreatorEntity from "../../../../module/entities/creatorEntity/mdCreatorEntity";
import MdEntity from "../../../../module/entity/mdEntity";

const {
  TABLE_NAME,
  col,
} = MdCreatorEntity;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .createTable(TABLE_NAME, (table) => {
      table
        .uuid(col("ceId", false))
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .notNullable();
      table
        .uuid(col("ceCreatorId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table
        .uuid(col("ceEntityId", false))
        .references(MdEntity.col("entityId", false))
        .inTable(MdEntity.TABLE_NAME);
      table.string(col("ceEntityType", false))
        .notNullable();
      table.timestamp(col("ceCreatedAt", false), { useTz: false })
        .defaultTo(knex.fn.now());
      table.index(col("ceCreatorId", false), undefined, undefined);
      table.index(col("ceEntityId", false), undefined, undefined);
      table.index(col("ceEntityType", false), undefined, undefined);
      table.index(col("ceCreatedAt", false), undefined, undefined);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
