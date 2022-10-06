import * as Knex from "knex";
import { QueryBuilder } from "knex";


export async function up(knex: Knex): Promise<QueryBuilder> {
  return knex.raw(`
  create or replace function get_sum_value(
    tablename text
  ) 
    returns int as 
  '
  declare total_sum integer;
  begin
     EXECUTE tablename
     INTO total_sum;
     return total_sum;
  end;
  '
  language plpgsql;
  `);
}

export async function down(knex: Knex): Promise<void> {
}

