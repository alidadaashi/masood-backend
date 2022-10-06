import { QueryBuilder, Transaction } from "knex";
import { DoSchema } from "../database/doSchema";

export type DbTables = keyof DoSchema;

export type TProxyTrx = {
  getAll: <Table extends DbTables>(tableName: Table, fields: (
    keyof DoSchema[Table])[]
  ) => QueryBuilder<DoSchema[Table][], DoSchema[Table][]>,

  findAllPickField: <Table extends DbTables>(
    tableName: Table, field: keyof DoSchema[Table]
  ) => QueryBuilder<DoSchema[Table][], DoSchema[Table][]>,
};

export type TCustomTrx = Transaction & TProxyTrx;
