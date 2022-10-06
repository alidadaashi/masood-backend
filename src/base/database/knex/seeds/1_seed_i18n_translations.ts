import * as Knex from "knex";
import { buildAndInsertTranslations } from "../../../../../i18n/srv/srI18n";

export async function seed(knex: Knex): Promise<void> {
  return knex.transaction((trx) => buildAndInsertTranslations(trx));
}

export const other = "";
