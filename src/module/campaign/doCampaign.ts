import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../base/dao/doBase";
import MdCampaign from "./mdCampaign";
import MdCampaignSupplier from "./campaignSupplier/mdCampaignSupplier";
import MdVendorSupplier from "../../vedi/module/vendorSupplier/MdVendorSupplier";
import MdGroupDetails from "../entities/group/mdGroupDetails";
import MdCampaignRecord from "./campaignRecord/mdCampaignRecord";
import MdCampaignInstanceFieldRec from "./campSuppInstanceFieldRec/mdCampSuppInstanceFieldRec";
import MdCampaignFieldDescriptor from "./campaignFieldDescriptor/mdCampaignFieldDescriptor";
import MdCampaignField from "./campaignField/mdCampaignField";
import MdCreatorEntity from "../entities/creatorEntity/mdCreatorEntity";
import MdEntity from "../entity/mdEntity";
import { EntityStatusTypesType, tpGetType } from "../shared/types/tpShared";
import { tpGetAllCampaigns, tpGetCampaignsSummary, tpGetRecordsForCampaign } from "./tpCampaign";
import MdCampaignFieldResp from "./campaignFieldResp/mdCampaignFieldResp";
import {
  CAMPAIGN_DETAIL_PROD_STATUS_APPROVED, CAMP_DETAIL_CATEGORY_COMMENT_FIELD_DESC_ID,
  CAMPAIGN_DETAIL_PROD_STATUS_REJECT, CAMPAIGN_STATUS_CONFIRM, CAMPAIGN_STATUS_NEW,
  CAMPAIGN_STATUS_SUBMIT_FOR_APPROVAL, CAMPAIGN_STATUS_VIEWED, CAMPAIGN_STATUS_WITHDRAW_FROM_APPROVAL,
} from "../shared/data/dtCampaignFieldRecords";
import MdUser from "../user/mdUser";

const columnsForAllCampaigns = [
  MdCampaign.col("cId"),
  MdCampaign.col("cTextNo"),
  MdCampaign.col("cText"),
  MdCampaign.col("cCode"),
  MdCampaign.col("cDescription"),
  MdCampaign.col("cReferenceText"),
  MdCampaign.col("cStartDate"),
  MdCampaign.col("cEndDate"),
  MdCampaign.col("cErpCode"),
  MdCampaign.col("cReleaseDate"),
  MdCampaign.col("cDeadline"),
  MdCampaign.col("cCreatedAt"),
];

const columnsForCampaignList = [
  ...columnsForAllCampaigns,
  MdCampaignSupplier.col("csStatus"),
  MdCampaignSupplier.col("csId"),
];

class DoCampaign extends DoBase<MdCampaign> {
  constructor() {
    super(MdCampaign.TABLE_NAME);
  }

  getDefaultQb(trx: Transaction) {
    return trx(this.tableName)
      .select(MdCreatorEntity.col("ceCreatorId"))
      .join(MdEntity.TABLE_NAME, MdEntity.col("entityId"), this.col("cEntityId"))
      .leftJoin(MdCreatorEntity.TABLE_NAME, MdCreatorEntity.col("ceEntityId"), MdCampaign.col("cEntityId"))
      .where(MdEntity.col("entityStatus"), tpGetType<EntityStatusTypesType>("active"))
      .groupBy(MdCreatorEntity.col("ceCreatorId"));
  }

  getSupplierBasedCampProductsCounts(trx: Transaction) {
    const campaignRecordsCount = trx(MdCampaignRecord.TABLE_NAME)
      .count()
      .where(MdCampaignRecord.col("crCampId"), trx.raw("??", [this.col("cId")]));

    const campaignApprovedProductsCount = trx(MdCampaignRecord.TABLE_NAME)
      .count()
      .join(MdCampaignFieldResp.TABLE_NAME, MdCampaignFieldResp.col("cfrCampRecordId"), MdCampaignRecord.col("crId"))
      .where(MdCampaignRecord.col("crCampId"), trx.raw("??", [this.col("cId")]))
      .andWhere(MdCampaignFieldResp.col("cfrFieldDescriptorId"), trx.raw("?", CAMP_DETAIL_CATEGORY_COMMENT_FIELD_DESC_ID))
      .andWhere(MdCampaignFieldResp.col("cfrValue"), trx.raw("?", CAMPAIGN_DETAIL_PROD_STATUS_APPROVED))
      .andWhere(MdCampaignFieldResp.col("cfrCampSupplierId"), trx.raw("??", [MdCampaignSupplier.col("csSupplierId")]));

    const campaignRejectedProductsCount = trx(MdCampaignRecord.TABLE_NAME)
      .count()
      .join(MdCampaignFieldResp.TABLE_NAME, MdCampaignFieldResp.col("cfrCampRecordId"), MdCampaignRecord.col("crId"))
      .where(MdCampaignRecord.col("crCampId"), trx.raw("??", [this.col("cId")]))
      .andWhere(MdCampaignFieldResp.col("cfrFieldDescriptorId"), trx.raw("?", CAMP_DETAIL_CATEGORY_COMMENT_FIELD_DESC_ID))
      .andWhere(MdCampaignFieldResp.col("cfrValue"), trx.raw("?", CAMPAIGN_DETAIL_PROD_STATUS_REJECT))
      .andWhere(MdCampaignFieldResp.col("cfrCampSupplierId"), trx.raw("??", [MdCampaignSupplier.col("csSupplierId")]));

    return ([
      trx.raw(`(${campaignRecordsCount}) as ??`, ["campaignTotalProducts"] as (keyof tpGetAllCampaigns)[]),
      trx.raw(`(${campaignApprovedProductsCount}) as ??`, ["campaignApprovedProducts"] as (keyof tpGetAllCampaigns)[]),
      trx.raw(`(${campaignRejectedProductsCount}) as ??`, ["campaignRejectedProducts"] as (keyof tpGetAllCampaigns)[]),
      trx.raw(`((${campaignRecordsCount})-(${campaignApprovedProductsCount})-(${campaignRejectedProductsCount})) as ??`,
        ["campaignApprovalPendingProducts"] as (keyof tpGetAllCampaigns)[]),
    ]);
  }

  getAllCampaigns(trx: Transaction, selectedUserInstance: string): QueryBuilder<tpGetAllCampaigns[]> {
    return trx(this.tableName)
      .select([
        ...columnsForCampaignList,
        ...this.getSupplierBasedCampProductsCounts(trx),
        MdGroupDetails.col("gName"),
        trx.raw("?? as ??", [MdUser.col("uFirstName"), "cCreator"]),
      ])
      .join(MdVendorSupplier.TABLE_NAME, MdVendorSupplier.col("vsVendorId"), this.col("cInstanceId"))
      .join(MdGroupDetails.TABLE_NAME, MdGroupDetails.col("gEntityId"), MdVendorSupplier.col("vsSupplierId"))
      .join(MdUser.TABLE_NAME, MdUser.col("uEntityId"), this.col("cCreator"))
      .join(MdCampaignSupplier.TABLE_NAME, {
        csCampId: "cId",
        csSupplierId: "vsSupplierId",
      } as Record<keyof MdCampaignSupplier, keyof Partial<MdCampaign & MdVendorSupplier>>)
      .where(this.col("cInstanceId"), selectedUserInstance);
  }

  getAllCampaignsByQb(trx: Transaction, qb: QueryBuilder, selectedInstance?: string): QueryBuilder<tpGetAllCampaigns[]> {
    qb.select([
      ...columnsForCampaignList,
      ...this.getSupplierBasedCampProductsCounts(trx),
      MdGroupDetails.col("gName"),
      MdUser.col("uFirstName"),
    ])
      .join(MdVendorSupplier.TABLE_NAME, MdVendorSupplier.col("vsVendorId"), this.col("cInstanceId"))
      .join(MdGroupDetails.TABLE_NAME, MdGroupDetails.col("gEntityId"), MdVendorSupplier.col("vsSupplierId"))
      .join(MdUser.TABLE_NAME, MdUser.col("uEntityId"), this.col("cCreator"))
      .join(MdCampaignSupplier.TABLE_NAME, {
        csCampId: "cId",
        csSupplierId: "vsSupplierId",
      } as Record<keyof MdCampaignSupplier, keyof Partial<MdCampaign & MdVendorSupplier>>)
      .groupBy([...columnsForCampaignList, MdGroupDetails.col("gName"), MdUser.col("uFirstName")]);

    if (selectedInstance) qb.where(this.col("cInstanceId"), selectedInstance);

    return qb;
  }

  getAllCampaignsByDateRange(trx: Transaction, selectedUserInstance: string,
    startDate: string, endDate: string): QueryBuilder<tpGetAllCampaigns[]> {
    return this.getAllCampaigns(trx, selectedUserInstance)
      .where(this.col("cCreatedAt"), ">", startDate)
      .where(this.col("cCreatedAt"), "<", endDate);
  }

  getAllCampaignsForSupplierByQb(
    trx: Transaction, qb: QueryBuilder, selectedInstance?: string,
  ): QueryBuilder<tpGetAllCampaigns[]> {
    qb.select([
      ...columnsForCampaignList,
      ...this.getSupplierBasedCampProductsCounts(trx),
      MdGroupDetails.col("gName"),
    ])
      .join(MdGroupDetails.TABLE_NAME, MdGroupDetails.col("gEntityId"), MdCampaign.col("cInstanceId"))
      .join(MdCampaignSupplier.TABLE_NAME, MdCampaignSupplier.col("csCampId"), this.col("cId"))
      .groupBy([...columnsForCampaignList, MdGroupDetails.col("gName")]);

    if (selectedInstance) qb.where(MdCampaignSupplier.col("csSupplierId"), selectedInstance);
    return qb;
  }

  getAllCampaignsForSupplier(trx: Transaction, selectedUserInstance: string): QueryBuilder<tpGetAllCampaigns[]> {
    return trx(this.tableName)
      .select([...columnsForCampaignList, MdGroupDetails.col("gName")])
      .join(MdGroupDetails.TABLE_NAME, MdGroupDetails.col("gEntityId"), MdCampaign.col("cInstanceId"))
      .join(MdCampaignSupplier.TABLE_NAME, MdCampaignSupplier.col("csCampId"), this.col("cId"))
      .where(MdCampaignSupplier.col("csSupplierId"), selectedUserInstance);
  }

  getRecordsForCampaign(trx: Transaction, campaignId: string): QueryBuilder<tpGetRecordsForCampaign[]> {
    return trx(this.tableName)
      .select([
        MdCampaignInstanceFieldRec.col("cifId"),
        MdCampaignRecord.col("crId"),
        MdCampaignFieldDescriptor.col("cfdName"),
        MdCampaignFieldDescriptor.col("cfdAcceptableRespType"),
        MdCampaignFieldDescriptor.col("cfdSlug"),
        MdCampaignField.col("cfEditableByVendor"),
        MdCampaignField.col("cfEditableBySupplier"),
      ])
      .join(MdCampaignRecord.TABLE_NAME, MdCampaignRecord.col("crCampId"), this.col("cId"))
      .join(MdCampaignInstanceFieldRec.TABLE_NAME,
        MdCampaignInstanceFieldRec.col("cifCampRecordId"), MdCampaignRecord.col("crId"))
      .join(MdCampaignField.TABLE_NAME,
        MdCampaignField.col("cfId"), MdCampaignInstanceFieldRec.col("cifCampFieldId"))
      .join(MdCampaignFieldDescriptor.TABLE_NAME,
        MdCampaignFieldDescriptor.col("cfdId"), MdCampaignField.col("cfFieldDescriptorId"))
      .where(this.col("cId"), campaignId);
  }

  getCampaignsSummary(
    trx: Transaction, selectedUserInstance: string,
  ): QueryBuilder<tpGetCampaignsSummary[]> {
    const campaignSuppliersCount = trx(MdCampaignSupplier.TABLE_NAME)
      .count()
      .join(MdVendorSupplier.TABLE_NAME, MdVendorSupplier.col("vsSupplierId"), MdCampaignSupplier.col("csSupplierId"))
      .where(MdCampaignSupplier.col("csCampId"), trx.raw("??", [this.col("cId")]));

    const campaignRecordsCount = trx(MdCampaignRecord.TABLE_NAME)
      .count()
      .where(MdCampaignRecord.col("crCampId"), trx.raw("??", [this.col("cId")]));

    const campaignRejectedProductsCount = trx(MdCampaignRecord.TABLE_NAME)
      .count()
      .join(MdCampaignFieldResp.TABLE_NAME, MdCampaignFieldResp.col("cfrCampRecordId"), MdCampaignRecord.col("crId"))
      .where(MdCampaignRecord.col("crCampId"), trx.raw("??", [this.col("cId")]))
      .andWhere(MdCampaignFieldResp.col("cfrFieldDescriptorId"), trx.raw("?", CAMP_DETAIL_CATEGORY_COMMENT_FIELD_DESC_ID))
      .andWhere(MdCampaignFieldResp.col("cfrValue"), trx.raw("?", CAMPAIGN_DETAIL_PROD_STATUS_REJECT));

    const campaignApprovedProductsCount = trx(MdCampaignRecord.TABLE_NAME)
      .count()
      .join(MdCampaignFieldResp.TABLE_NAME, MdCampaignFieldResp.col("cfrCampRecordId"), MdCampaignRecord.col("crId"))
      .where(MdCampaignRecord.col("crCampId"), trx.raw("??", [this.col("cId")]))
      .andWhere(MdCampaignFieldResp.col("cfrFieldDescriptorId"), trx.raw("?", CAMP_DETAIL_CATEGORY_COMMENT_FIELD_DESC_ID))
      .andWhere(MdCampaignFieldResp.col("cfrValue"), trx.raw("?", CAMPAIGN_DETAIL_PROD_STATUS_APPROVED));

    const isCampaignActive = trx.raw("?? > NOW()", [this.col("cEndDate")]);
    return trx(this.tableName)
      .join(MdUser.TABLE_NAME, MdUser.col("uEntityId"), this.col("cCreator"))
      .select([
        ...columnsForAllCampaigns,
        ...this.getSupplierDataForCampaignSummary(trx),
        trx.raw("?? as ??", [MdUser.col("uFirstName"), "cCreator"]),
        trx.raw(`(${campaignSuppliersCount}) as ??`, ["campaignTotalSuppliers"] as (keyof tpGetCampaignsSummary)[]),
        trx.raw(`(${campaignRecordsCount}) as ??`, ["campaignTotalRecords"] as (keyof tpGetCampaignsSummary)[]),
        trx.raw(`((${campaignSuppliersCount})*(${campaignRecordsCount})) as ??`,
          ["campaignTotalProducts"] as (keyof tpGetCampaignsSummary)[]),
        trx.raw(`(${campaignApprovedProductsCount}) as ??`, ["campaignApprovedProducts"] as (keyof tpGetCampaignsSummary)[]),
        trx.raw(`(${campaignRejectedProductsCount}) as ??`, ["campaignRejectedProducts"] as (keyof tpGetCampaignsSummary)[]),
        trx.raw(`((${campaignSuppliersCount})*(${campaignRecordsCount})-
        (${campaignApprovedProductsCount})-(${campaignRejectedProductsCount})) as ??`,
          ["campaignApprovalPendingProducts"] as (keyof tpGetCampaignsSummary)[]),
        trx.raw(`(${isCampaignActive}) as ??`, ["campaignActiveStatus"] as (keyof tpGetCampaignsSummary)[]),
      ])
      .where(this.col("cInstanceId"), selectedUserInstance);
  }

  getSupplierDataForCampaignSummary(trx: Transaction) {
    const campaignSupplierWithTransactionCount = trx(MdCampaignSupplier.TABLE_NAME)
      .count()
      .where(MdCampaignSupplier.col("csCampId"), trx.raw("??", [this.col("cId")]))
      .whereIn(MdCampaignSupplier.col("csStatus"), [
        trx.raw("?", CAMPAIGN_STATUS_SUBMIT_FOR_APPROVAL),
        trx.raw("?", CAMPAIGN_STATUS_WITHDRAW_FROM_APPROVAL),
      ]);

    const campaignSupplierWithNoTransactionCount = trx(MdCampaignSupplier.TABLE_NAME)
      .count()
      .where(MdCampaignSupplier.col("csCampId"), trx.raw("??", [this.col("cId")]))
      .whereIn(MdCampaignSupplier.col("csStatus"), [
        trx.raw("?", CAMPAIGN_STATUS_NEW),
        trx.raw("?", CAMPAIGN_STATUS_VIEWED),
      ]);

    const campaignSupplierWhoseProcessHasCompletedCount = trx(MdCampaignSupplier.TABLE_NAME)
      .count()
      .where(MdCampaignSupplier.col("csCampId"), trx.raw("??", [this.col("cId")]))
      .andWhere(MdCampaignSupplier.col("csStatus"), trx.raw("?", CAMPAIGN_STATUS_CONFIRM));

    return ([
      trx.raw(`(${campaignSupplierWithTransactionCount}) as ??`,
        ["campaignSupplierWithTransactionCount"] as (keyof tpGetCampaignsSummary)[]),
      trx.raw(`(${campaignSupplierWhoseProcessHasCompletedCount}) as ??`,
        ["campaignSupplierWhoseProcessHasCompletedCount"] as (keyof tpGetCampaignsSummary)[]),
      trx.raw(`(${campaignSupplierWithNoTransactionCount}) as ??`,
        ["campaignSupplierWithNoTransactionCount"] as (keyof tpGetCampaignsSummary)[])]);
  }

  getCampaignsSummaryOwnInGroupQb(
    trx: Transaction, selectedUserInstance: string, groupIds: string[], userEntityId: string,
  ): QueryBuilder<tpGetCampaignsSummary[]> {
    return this.getCampaignsSummary(trx, selectedUserInstance)
      .join(MdEntity.TABLE_NAME, MdEntity.col("entityId"), MdCampaign.col("cEntityId"))
      .leftJoin(MdCreatorEntity.TABLE_NAME, MdCreatorEntity.col("ceEntityId"), MdCampaign.col("cEntityId"))
      .where(MdEntity.col("entityStatus"), tpGetType<EntityStatusTypesType>("active"))
      .where(MdCreatorEntity.col("ceCreatorId"), userEntityId)
      .whereIn(MdCampaign.col("cInstanceId"), groupIds);
  }
}

export default new DoCampaign();
