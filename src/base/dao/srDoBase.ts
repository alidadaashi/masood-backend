import { QueryBuilder, Transaction } from "knex";
import { TCustomTrx } from "./tpDoBase";
import knex from "../database/cfgKnex";
import { doCustomFunctions } from "./doBaseV1";

const srGetTrxWithAdditionalFn = (trx: Transaction):TCustomTrx => ({
  ...trx,
  ...doCustomFunctions(trx),
} as TCustomTrx);

export const srDbTransaction = (
  cb: (tx: TCustomTrx) => (void|QueryBuilder)|Promise<void|QueryBuilder>,
):Promise<unknown> => knex.transaction((trx: Transaction) => cb(srGetTrxWithAdditionalFn(trx)));

export const other = "";
