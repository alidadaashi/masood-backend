import { QueryBuilder, Transaction } from "knex";
import MdBase from "../models/mdBase";

type defaultOperators = "=" | "LIKE";

class DoBase<Model extends MdBase, TblCols extends string | number | symbol = keyof Model> {
  protected tableName: string;

  protected returnedCols = "*";

  protected col(c: TblCols, withTablePrefix = false): string {
    return withTablePrefix ? `${this.tableName}.${String(c)}` : c as string;
  }

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  getAll(trx: Transaction, fields: TblCols[] | string = "*"): QueryBuilder<Model[], Model[]> {
    return trx(this.tableName)
      .select(fields);
  }

  findAllPickField(trx: Transaction, fields: TblCols): QueryBuilder<Model[], Model[]> {
    return trx(this.tableName)
      .pluck(fields as string);
  }

  findAllByPredicatePickField(
    trx: Transaction, predicate: Partial<Model>, pick: TblCols,
  ): QueryBuilder<string[], string[]> {
    return trx(this.tableName)
      .where(predicate)
      .pluck(pick as string);
  }

  findAllWhereColInPick(
    trx: Transaction, field: TblCols | string, value: string[], pick: TblCols,
  ): QueryBuilder<string[]> {
    return trx(this.tableName)
      .select(field)
      .whereIn(field as string, value)
      .pluck(pick as string);
  }

  findAllByCol(
    trx: Transaction, colName: TblCols, value: string, fields: TblCols[] | string = "*", operator: defaultOperators = "=",
  ): QueryBuilder<Model[], Model[]> {
    return trx(this.tableName)
      .select(fields)
      .where(colName as string, operator, value) as QueryBuilder<Model[], Model[]>;
  }

  findOneByCol(
    trx: Transaction, colName: TblCols, value: string, fields: TblCols[] | string = "*",
  ): QueryBuilder<Model, Model> {
    return trx(this.tableName)
      .where(colName as string, value)
      .first(fields);
  }

  findOneById(trx: Transaction, id: string): QueryBuilder<Model, Model> {
    return this.findOneByCol(trx, "id" as TblCols, id);
  }

  insertMany(
    trx: Transaction, models: Model[] | Model | Partial<Model>, fields: TblCols[] | string = this.returnedCols,
  ): QueryBuilder<Model[], Model[]> {
    return trx(this.tableName)
      .insert(models)
      .returning(fields as string[]);
  }

  insertOne(
    trx: Transaction, model: Model | Partial<Model>, fields: TblCols[] | string = this.returnedCols,
  ): QueryBuilder<Model[], Model[]> {
    return this.insertMany(trx, model, fields)
      .limit(1);
  }

  updateOneByColName(
    trx: Transaction, model: Partial<Model>, colName: TblCols, colValueByUpdate: string,
  ): QueryBuilder<Model[], Model[]> {
    return trx(this.tableName)
      .update(model)
      .where(colName as string, colValueByUpdate)
      .limit(1)
      .returning(this.returnedCols) as QueryBuilder<Model[], Model[]>;
  }

  updateOneById(trx: Transaction, model: Partial<Model>, id: string): QueryBuilder<Model[], Model[]> {
    return this.updateOneByColName(trx, model as Required<Model>, "id" as TblCols, id);
  }

  deleteOneByCol(trx: Transaction, col: TblCols, val: string): QueryBuilder<number> {
    return trx(this.tableName)
      .del()
      .limit(1)
      .where(col as string, val);
  }

  deleteOneById(trx: Transaction, id: string): QueryBuilder<number> {
    return this.deleteOneByCol(trx, "id" as TblCols, id);
  }

  deleteManyByCol(trx: Transaction, col: TblCols, val: string): QueryBuilder<number> {
    return trx(this.tableName)
      .where(col as string, val)
      .delete();
  }

  deleteManyByColWhereIn(trx: Transaction, col: TblCols, vals: string[]): QueryBuilder<number> {
    return trx(this.tableName)
      .whereIn(col as string, vals)
      .delete();
  }

  upsertMany(
    trx: Transaction, models: Model[] | Model | Partial<Model>,
    conflictConstraint: TblCols[] | string,
  ): QueryBuilder<Model[], Model[]> {
    return trx(this.tableName)
      .insert(models)
      .onConflict(conflictConstraint as string)
      .merge()
      .returning(this.returnedCols);
  }

  upsertManyByCol(
    trx: Transaction, models: Model[] | Model | Partial<Model>, colName: TblCols, colValueByUpdate: string,
    conflictConstraint: TblCols[] | string = "id",
  ): QueryBuilder<Model[], Model[]> {
    return this.upsertMany(trx, models, conflictConstraint)
      .where(`${this.tableName}.${String(colName)}`, colValueByUpdate);
  }

  findAllByPredicate(
    trx: Transaction, predicate: Partial<Model>, fields: TblCols[] | string = "*",
  ): QueryBuilder<Model[], Model[]> {
    return trx(this.tableName)
      .select(fields)
      .where(predicate) as QueryBuilder<Model[], Model[]>;
  }

  findOneByPredicate(
    trx: Transaction, predicate: Partial<Model>, fields: TblCols[] | string = "*",
  ): QueryBuilder<Model, Model> {
    return trx(this.tableName)
      .where(predicate)
      .first(fields);
  }

  existsByPredicate(
    trx: Transaction, predicate: Partial<Model>, fields: TblCols[] | string = "*",
  ): QueryBuilder<Model, Model> {
    return this.findOneByPredicate(trx, predicate, fields);
  }

  updateOneByPredicate(
    trx: Transaction, model: Partial<Model>, predicate: Partial<Model>,
  ): QueryBuilder<Model[], Model[]> {
    return trx(this.tableName)
      .update(model)
      .where(predicate)
      .limit(1)
      .returning(this.returnedCols) as QueryBuilder<Model[], Model[]>;
  }

  findAllWhereColIn(
    trx: Transaction, colName: TblCols, value: string[], fields: TblCols[] | string = "*",
  ): QueryBuilder<Model[], Model[]> {
    return trx(this.tableName)
      .select(fields)
      .whereIn(colName as string, value) as QueryBuilder<Model[], Model[]>;
  }
}

export default DoBase;
