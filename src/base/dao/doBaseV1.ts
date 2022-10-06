import { Transaction } from "knex";
import { TProxyTrx } from "./tpDoBase";
import { srDbTransaction } from "./srDoBase";

export const doGetAll = (
  trx: Transaction,
):TProxyTrx["getAll"] => (tableName, cols) => trx(tableName).select(cols);

export const doFindAllPickField = (
  trx: Transaction,
):TProxyTrx["findAllPickField"] => (tableName, field) => trx(tableName).pluck(field);

export const doCustomFunctions = (
  trx: Transaction,
):{getAll: TProxyTrx["getAll"], findAllPickField:TProxyTrx["findAllPickField"] } => ({
  getAll: doGetAll(trx),
  findAllPickField: doFindAllPickField(trx),
});

export const doExampleCode = ():void => {
  srDbTransaction(async (trx) => {
    await trx.getAll("entity", ["entityId"]);
  });
};
