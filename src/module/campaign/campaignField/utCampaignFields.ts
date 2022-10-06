import { QueryBuilder, Transaction } from "knex";
import doCampaignField from "./doCampaignField";
import { tpGetAllCampFields, tpGetCampaignRecords } from "../tpCampaign";
import MdCampaignRecord from "../campaignRecord/mdCampaignRecord";
import MdCampaignFieldDescriptor from "../campaignFieldDescriptor/mdCampaignFieldDescriptor";
import MdCampaignInstanceFieldRec from "../campSuppInstanceFieldRec/mdCampSuppInstanceFieldRec";
import MdCampaignFieldResp from "../campaignFieldResp/mdCampaignFieldResp";
import { utEscapeSingleQuotes } from "../../shared/utils/utString";

export const utGetSupplierEditableFields = async (
  trx: Transaction, campId: string,
):Promise<tpGetAllCampFields> => {
  const campaignFields = await doCampaignField.getCampaignAllFields(trx, campId);
  return campaignFields.filter((cf) => cf.cfEditableBySupplier);
};

export const utGetInstanceEditableFields = async (
  trx: Transaction, campId: string,
):Promise<tpGetAllCampFields> => {
  const campaignFields = await doCampaignField.getCampaignAllFields(trx, campId);
  return campaignFields.filter((cf) => cf.cfEditableByVendor);
};

export const utGetAllCampaignFieldsSlug = (trx: Transaction, campId: string): Promise<string[]> => doCampaignField
  .getCampaignAllFields(trx, campId)
  .clearSelect()
  .pluck(MdCampaignFieldDescriptor.col("cfdSlug"));

const utGetUnnestColumns = (columns: string[]) => {
  const cols = columns.toString();
  return `SELECT unnest('{${cols}}'::text[])`;
};

const utGetCtColumns = (trx: Transaction, columns: string[]) => {
  const cols = columns.map(() => "?? char varying").toString();
  return trx.raw(cols, columns);
};

export const utTransformCampaignFieldIntoRecords = (
  trx: Transaction,
  qb: QueryBuilder,
  campaignFieldsSludges: string[],
): QueryBuilder<tpGetCampaignRecords[]> => {
  const recordCol = trx.raw("??", MdCampaignRecord.col("crId", false));
  const columns = {
    recordId: recordCol,
    categorizedBy: MdCampaignFieldDescriptor.col("cfdSlug"),
    categorizedRowValue: trx.raw("coalesce(??, ??) as ??", [
      MdCampaignFieldResp.col("cfrValue"),
      MdCampaignInstanceFieldRec.col("cifValue"),
      MdCampaignInstanceFieldRec.col("cifValue", false),
    ]),
  };
  qb.clearSelect().select(trx.raw(`
    :recordId:,
    :categorizedBy:,
    :categorizedRowValue:
  `, columns)).orderByRaw(":recordId:, :categorizedBy:", columns);

  const query = trx(trx.raw(`
    crosstab (
        '${utEscapeSingleQuotes(qb.toQuery())}', $$ ${utGetUnnestColumns(campaignFieldsSludges)} $$
    ) AS ct(${recordCol} uuid, ${utGetCtColumns(trx, campaignFieldsSludges)})
  `)).select("*");

  return query;
};
