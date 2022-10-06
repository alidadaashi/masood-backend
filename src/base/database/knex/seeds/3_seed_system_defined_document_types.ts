import * as Knex from "knex";
import { QueryBuilder } from "knex";
import DoDocAndNoteType from "../../../../module/documentAndNotes/docAndNoteType/doDocAndNoteType";
import dtSysDefDocAndNoteTypes from "../../../../module/shared/data/dtSysDefDocAndNoteTypes";

export async function seed(knex: Knex): Promise<QueryBuilder> {
  return knex.transaction(async (trx) => {
    await DoDocAndNoteType.insertMany(trx, dtSysDefDocAndNoteTypes);
  });
}
