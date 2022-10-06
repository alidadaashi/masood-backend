import { QueryBuilder, Transaction } from "knex";
import knex from "../../../base/database/cfgKnex";
import { tpDocAndNoteTypes, tpDocumentOrigin } from "../../shared/types/tpShared";
import DoBase from "../../../base/dao/doBase";
import MdDocAndNoteType from "./mdDocAndNoteType";
import doDocAndNoteTypeInstance from "../docAndNoteTypeInstance/doDocAndNoteTypeInstance";
import doDocAndNoteTypeCompany from "../docAndNoteTypeCompany/doDocAndNoteTypeCompany";

class DoDocAndNoteType extends DoBase<MdDocAndNoteType> {
  constructor() {
    super(MdDocAndNoteType.TABLE_NAME);
  }

  getAllDocAndNoteType(
    trx: Transaction,
    dntType: tpDocAndNoteTypes,
    dntDefinedType?: tpDocumentOrigin,
  ): QueryBuilder {
    let qb = trx(this.tableName);
    const instanceQb = doDocAndNoteTypeInstance.getDocAndNoteTypeInstance(trx);
    const companyQb = doDocAndNoteTypeCompany.getDocAndNoteTypeCompany(trx);
    const mainType = trx.raw(`
    (
      case  
      when SUBQ."dntHierarchyType"='main' THEN SUBQ."dntName" ELSE "${this.tableName}"."dntName"
        end
    ) as ??`, ["dntMainType"]);

    const subType = trx.raw(`
    (
      case  
      when SUBQ."dntHierarchyType"='main' THEN '' ELSE SUBQ."dntName"
       end
    ) as ??`, ["dntSubType"]);

    const whereClause = dntDefinedType ? trx.raw(qb.whereRaw("?? = ? and ?? = ?", [this.col("dntDefinedType"),
      dntDefinedType, this.col("dntType"), dntType]).toQuery()).wrap("(", ")")
      : trx.raw(qb.whereRaw("?? = ?", [this.col("dntType"), dntType]).toQuery()).wrap("(", ")");

    const subQ = trx.raw("? as SUBQ", [whereClause]);
    qb = trx.select([
      trx.raw("SUBQ.\"dntId\" as ??", ["dntId"]),
      mainType, subType,
      trx.raw("SUBQ.\"dntIsValidityRequired\" as ??", ["dntIsValidityRequired"]),
      trx.raw("SUBQ.\"dntIsPrivNeeded\" as ??", ["dntIsPrivNeeded"]),
      trx.raw("SUBQ.\"dntIsActive\" as ??", ["dntIsActive"]),
      trx.raw("SUBQ.\"dntType\" as ??", ["dntType"]),
      trx.raw("SUBQ.\"dntDefinedType\" as ??", ["dntDefinedType"]),
      trx.raw("SUBQ.\"dntHierarchyType\" as ??", ["dntHierarchyType"]),
      trx.raw("SUBQ.\"dntParentTypeId\" as ??", ["dntParentTypeId"]),
      trx.raw(`ARRAY(${instanceQb}) as ??`, ["dntInstance"]),
      trx.raw(`ARRAY(${companyQb}) as ??`, ["dntCompany"]),
      trx.raw("SUBQ.\"dntCreatedAt\" as ??", ["dntCreatedAt"]),
    ]).from(subQ);
    const allDocumentTypesWrappedQb = (knex.select("*").from((qb.leftJoin(MdDocAndNoteType.TABLE_NAME, (join) => (join
      .on(MdDocAndNoteType.col("dntId"),
        trx.raw("SUBQ.\"dntParentTypeId\""))))).as("SUBQ"))).orderByRaw("lower(??) desc, lower(??) asc, ?? desc",
      ["dntMainType", "dntSubType", "dntCreatedAt"]);

    return allDocumentTypesWrappedQb;
  }
}

export default new DoDocAndNoteType();
