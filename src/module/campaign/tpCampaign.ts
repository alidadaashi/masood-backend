import MdCampaignInstanceFieldRec from "./campSuppInstanceFieldRec/mdCampSuppInstanceFieldRec";
import MdCampaignRecord from "./campaignRecord/mdCampaignRecord";
import MdCampaignFieldDescriptor from "./campaignFieldDescriptor/mdCampaignFieldDescriptor";
import MdCampaignField from "./campaignField/mdCampaignField";
import MdCampaign from "./mdCampaign";
import MdCampaignSupplier from "./campaignSupplier/mdCampaignSupplier";
import MdGroupDetails from "../entities/group/mdGroupDetails";
import MdCampaignFieldResp from "./campaignFieldResp/mdCampaignFieldResp";

export const dtCampaignStatuses = [
  "New",
  "Submit for Approval",
  "Withdraw From Approval",
  "Cancel",
  "Viewed",
  "Confirm",
  "Reject",
  "Request Revision",
] as const;

export type tpCampaignStatuses = typeof dtCampaignStatuses[number];

export type tpGetAllCampaigns = Pick<
  MdCampaign &
  MdCampaignSupplier &
  MdGroupDetails,
  "cId" |
  "cCreator" |
  "cDescription" |
  "cCreatedAt" |
  "csStatus" |
  "gName" |
  "csId" |
  "cTextNo" |
  "cText" |
  "cCode" |
  "cErpCode" |
  "cReferenceText" |
  "cStartDate" |
  "cEndDate" |
  "cReleaseDate" |
  "cDeadline"
> & {
  campaignTotalProducts: number,
  campaignApprovedProducts: number,
  campaignRejectedProducts: number,
  campaignApprovalPendingProducts: number
};

export type tpGetRecordsForCampaign = Pick<
  MdCampaignInstanceFieldRec &
  MdCampaignRecord &
  MdCampaignFieldDescriptor &
  MdCampaignField,
  "cifId" |
  "crId" |
  "cfdName" |
  "cfdAcceptableRespType" |
  "cfdSlug" |
  "cifValue" |
  "cfEditableByVendor" |
  "cfEditableBySupplier"
>;

export type tpGetAllCampFields = Pick<(
  MdCampaignField & MdCampaignFieldDescriptor
), "cfId" |
  "cfdName" |
  "cfFieldDescriptorId" |
  "cfEditableBySupplier" |
  "cfEditableByVendor" |
  "cfdSlug" |
  "cfdAcceptableRespType">[];

export type tpGetCampaignRecords = Record<string, string>;

export type tpCampaignDetailsRespData = {
  columns: tpGetAllCampFields, list: tpGetCampaignRecords[], total: number, campaignSupplierId: string
}

export type tpGetCampaignsSummary = MdCampaign & {
  campaignTotalSuppliers: number,
  campaignTotalRecords: number,
  campaignTotalProducts: number,
  campaignApprovedProducts: number,
  campaignRejectedProducts: number,
  campaignApprovalPendingProducts: number
  campaignActiveStatus: boolean,
  campaignSupplierWithTransactionCount: number,
  campaignSupplierWhoseProcessHasCompletedCount: number,
  campaignSupplierWithNoTransactionCount: number,
}

export type tpGetAllCampaignFields = Pick<(MdCampaignField & MdCampaignFieldDescriptor),
  "cfId" | "cfdName" | "cfFieldDescriptorId" | "cfdSlug">;

export type tpCampaignResponseData = {
  supplierId: string
  instanceId: string,
  responseBy: MdCampaignFieldResp["cfrResponseBy"]
}

export type tpCampaignsRecord = {
  frm__lbl__status: string;
  frm__lbl__department_code: string;
  frm__lbl__department_definition: string;
  frm__lbl__goods_group_code: string;
  frm__lbl__goods_group_description: string;
  frm__lbl__item_no: string;
  frm__lbl__product_description: string;
  frm__lbl__barcode: string;
  frm__lbl__seller: string;
  frm__lbl__seller_description: string;
  frm__lbl__material_condition: string;
  frm__lbl__vat: string;
  frm__lbl__is_the_site_open: string;
  frm__lbl__is_shipping_free: string;
  frm__lbl__status_code: string;
  frm__lbl__cargo_integration_status: string;
  frm__lbl__cargo_company: string;
  frm__lbl__desi: string;
  frm__lbl__shipping_cost: string;
  frm__lbl__purchase_price: string;
  frm__lbl__desk_sales_price: string;
  frm__lbl__campaign_purchase_price: string;
  frm__lbl__campaign_selling_price: string;
  frm__lbl__current_purchase_price: string;
  frm__lbl__current_sale_price: string;
  frm__lbl__purchase_end_date_with_campaign: string;
  frm__lbl__campaign_sale_end_date: string;
  frm__lbl__department_real_margin: string;
  frm__lbl__campaign_real_margin: string;
  frm__lbl__max_sales_price_that_can_be_entered: number;
  frm__lbl__current_campaign_margin: string;
  frm__lbl__current_campaign_real_margin: string;
  frm__lbl__recommendation_purchase_price_discount_rate: number;
  frm__lbl__suggestion_purchase_price: number;
  frm__lbl__confirmed_purchase_price: number;
  frm__lbl__valid_selling_price: number;
  frm__lbl__category_comment: string;
  frm__lbl__hero_evaluation_result: string;
  frm__lbl__main_firm_note: string;
  frm__lbl__campaign_participation?: boolean;
  frm__lbl__suggestion?: string;
  frm__lbl__discount_type?: string;
  frm__lbl__discount_rate_over_purchase_price?: number;
  frm__lbl__discounted_purchase_price_amount?: number;
  frm__lbl__recommended_campaign_sales_price?: number;
  frm__lbl__supplier_note?: string;
}

export type tpCampaignsRecordKeys = keyof tpCampaignsRecord

export type tpCampaignApiData = {
  cpId?: string;
  campaignsDescription: string;
  campaignsText: string;
  campaignsTextNo: string;
  campaignsCode: string;
  campaignsErpCode: string;
  campaignsRefText: string;
  campaignsStartDate: string;
  campaignsEndDate: string;
  campaignsReleaseDate: string;
  campaignsDeadlineDate: string;
  campaignsInstanceId: string;
  campaignsRecord: tpCampaignsRecord[];
}

export type tpCampaignDetailsResponse = tpGetAllCampaigns & {
  campaignDetail?: tpGetCampaignRecords[]
}
