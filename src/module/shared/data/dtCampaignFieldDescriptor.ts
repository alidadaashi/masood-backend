import { getSlug } from "../../../../i18n";
import MdCampaignFieldDescriptor from "../../campaign/campaignFieldDescriptor/mdCampaignFieldDescriptor";
import {
  RECOMMENDATION_PURCHASE_PRICE_DISCOUNT_RATE_ID, SUGGESTION_PURCHASE_PRICE_ID, CONFIRMED_PURCHASE_PRICE_ID,
  VALID_SELLING_PRICE_ID, CATEGORY_COMMENT_ID, HERO_EVALUATION_RESULT_ID, CAMPAIGN_PARTICIPATION_ID,
  SUGGESTION_ID, DISCOUNT_TYPE_ID, DISCOUNT_RATE_OVER_PURCHASE_PRICE_ID, DISCOUNTED_PURCHASE_PRICE_AMOUNT_ID,
  RECOMMENDED_CAMPAIGN_SALES_PRICE_ID,
} from "./dtCampaignFieldRecords";

const dtCampaignRecords: MdCampaignFieldDescriptor[] = [
  {
    cfdId: "11af0983-defe-44fb-b548-72722ed46171",
    cfdName: "Status",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__status"),
  },
  {
    cfdId: "8d19e2e5-9b85-40a5-94e4-8a35bc52d3fe",
    cfdName: "Department Code",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__department_code"),
  },
  {
    cfdId: "522c62c2-f6c2-4c28-9ad2-3b2ee6ba0d51",
    cfdName: "Department Definition",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__department_definition"),
  },
  {
    cfdId: "b6a94a3b-41ca-4ab1-9e09-f561dc143a85",
    cfdName: "Goods Group Code",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__goods_group_code"),
  },
  {
    cfdId: "c82c63a2-4c3f-449a-8afb-a5c4cc214ac4",
    cfdName: "Goods Group Description",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__goods_group_description"),
  },
  {
    cfdId: "1c6f766a-ada5-4364-b7a2-118e97a368ae",
    cfdName: "Item No.",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__item_no"),
  },
  {
    cfdId: "8de4b499-0d48-415a-91d8-45cd7df9eba4",
    cfdName: "Product description",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__product_description"),
  },
  {
    cfdId: "429b2a6e-d007-4886-b0b3-cd8ccff10616",
    cfdName: "Barcode",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__barcode"),
  },
  {
    cfdId: "ee7f55fd-31c5-446c-bebe-019c69c2e389",
    cfdName: "Seller",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__seller"),
  },
  {
    cfdId: "43e27b38-fa32-4eec-bdf6-d487ab28efdf",
    cfdName: "Seller Description",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__seller_description"),
  },
  {
    cfdId: "5c022910-7143-4584-991f-4088913ebc97",
    cfdName: "Material Condition",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__material_condition"),
  },
  {
    cfdId: "3157b41a-2287-4466-b76f-65f887cf714f",
    cfdName: "VAT",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__vat"),
  },
  {
    cfdId: "307c3ce9-d21e-44b4-aafb-712b4b2034a6",
    cfdName: "Is the Site Open?",
    cfdAcceptableRespType: "boolean",
    cfdSlug: getSlug("frm__lbl__is_the_site_open"),
  },
  {
    cfdId: "252904ca-a669-45ee-949c-b5bd260c1e7d",
    cfdName: "Is Shipping Free?",
    cfdAcceptableRespType: "boolean",
    cfdSlug: getSlug("frm__lbl__is_shipping_free"),
  },
  {
    cfdId: "405cbc66-33eb-4977-8764-e95878842451",
    cfdName: "Status Code",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__status_code"),
  },
  {
    cfdId: "b6de3c22-583e-4f29-a5fd-5216655c6db4",
    cfdName: "Cargo Integration Status",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__cargo_integration_status"),
  },
  {
    cfdId: "4c7a2d15-9917-44d4-b8c6-d97dc9529f5b",
    cfdName: "Cargo Company",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__cargo_company"),
  },
  {
    cfdId: "32581195-40a2-4c77-ac58-cc4843561416",
    cfdName: "desi",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__desi"),
  },
  {
    cfdId: "397d4523-cc82-4c74-9da4-63b32cff2cbc",
    cfdName: "Shipping cost",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__shipping_cost"),
  },
  {
    cfdId: "388f6162-2ac5-4cfa-a24c-7062218ce26d",
    cfdName: "PB00 (Purchase Price)",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__purchase_price"),
  },
  {
    cfdId: "02e69d0c-76e8-4522-bbec-45d34fe180f7",
    cfdName: "VKP0 (Desk Sales Price)",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__desk_sales_price"),
  },
  {
    cfdId: "cade50e8-efd0-4460-afb1-66f303405d18",
    cfdName: "PA00 (Campaign Purchase Price)",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__campaign_purchase_price"),
  },
  {
    cfdId: "8ebb39fe-7857-448a-be28-0a3001ebf946",
    cfdName: "VKZ1 (Campaign Selling Price)",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__campaign_selling_price"),
  },
  {
    cfdId: "981a613a-3462-45e3-9fa3-47ecea1b3c63",
    cfdName: "Current Purchase Price",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__current_purchase_price"),
  },
  {
    cfdId: "6504b126-3296-41b2-a806-bc4663c4993f",
    cfdName: "Current Sale Price",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__current_sale_price"),
  },
  {
    cfdId: "46bd7949-3e88-4225-a92a-27e0926c5d64",
    cfdName: "Purchase End Date with Campaign (PA00)",
    cfdAcceptableRespType: "date",
    cfdSlug: getSlug("frm__lbl__purchase_end_date_with_campaign"),
  },
  {
    cfdId: "74980752-6fbb-4e90-871a-54844101f46f",
    cfdName: "Campaign Sale End Date (VZK1)",
    cfdAcceptableRespType: "date",
    cfdSlug: getSlug("frm__lbl__campaign_sale_end_date"),
  },
  {
    cfdId: "275c00e2-f8f7-46ac-9aee-b47aa6efffbd",
    cfdName: "Department Real Margin",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__department_real_margin"),
  },
  {
    cfdId: "89e8aa25-1744-43ba-8aa1-7e50c836fcfd",
    cfdName: "Campaign Real Margin",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__campaign_real_margin"),
  },
  {
    cfdId: "6a468718-eb56-4486-b765-d442a18b63d7",
    cfdName: "Max. Sales Price that can be entered",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__max_sales_price_that_can_be_entered"),
  },
  {
    cfdId: "70d064f2-639e-4143-bac3-b4fecf8eaa39",
    cfdName: "Current Campaign Margin",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__current_campaign_margin"),
  },
  {
    cfdId: "f473916a-bd12-4f42-a0a9-2e20d4d82612",
    cfdName: "Current Campaign Real Margin",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__current_campaign_real_margin"),
  },
];

const dtVendorRecords: MdCampaignFieldDescriptor[] = [
  {
    cfdId: RECOMMENDATION_PURCHASE_PRICE_DISCOUNT_RATE_ID,
    cfdName: "Recommendation Purchase Price Discount Rate (%)",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__recommendation_purchase_price_discount_rate"),
  },
  {
    cfdId: SUGGESTION_PURCHASE_PRICE_ID,
    cfdName: "Suggestion Purchase Price",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__suggestion_purchase_price"),
  },
  {
    cfdId: CONFIRMED_PURCHASE_PRICE_ID,
    cfdName: "Confirmed Purchase Price",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__confirmed_purchase_price"),
  },
  {
    cfdId: VALID_SELLING_PRICE_ID,
    cfdName: "Valid Selling Price",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__valid_selling_price"),
  },
  {
    cfdId: CATEGORY_COMMENT_ID,
    cfdName: "Category Comment",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__category_comment"),
  },
  {
    cfdId: HERO_EVALUATION_RESULT_ID,
    cfdName: "Hero Evaluation Result",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__hero_evaluation_result"),
  },
  {
    cfdId: "a3defada-1640-4cac-ad4e-c81f7d6843fe",
    cfdName: "Main Firm Note",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__main_firm_note"),
  },

];

const dtSupplierRecords: MdCampaignFieldDescriptor[] = [
  {
    cfdId: CAMPAIGN_PARTICIPATION_ID,
    cfdName: "Campaign Participation",
    cfdAcceptableRespType: "boolean",
    cfdSlug: getSlug("frm__lbl__campaign_participation"),
  },
  {
    cfdId: SUGGESTION_ID,
    cfdName: "Hero Suggestion",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__suggestion"),
  },
  {
    cfdId: DISCOUNT_TYPE_ID,
    cfdName: "Discount Type",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__discount_type"),
  },
  {
    cfdId: DISCOUNT_RATE_OVER_PURCHASE_PRICE_ID,
    cfdName: "Discount Rate over Purchase Price",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__discount_rate_over_purchase_price"),
  },
  {
    cfdId: DISCOUNTED_PURCHASE_PRICE_AMOUNT_ID,
    cfdName: "Discounted Purchase Price Amount",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__discounted_purchase_price_amount"),
  },
  {
    cfdId: RECOMMENDED_CAMPAIGN_SALES_PRICE_ID,
    cfdName: "Recommended Campaign Sales Price",
    cfdAcceptableRespType: "decimal",
    cfdSlug: getSlug("frm__lbl__recommended_campaign_sales_price"),
  },
  {
    cfdId: "9fcb961f-ec97-4e63-accf-68b0544baee2",
    cfdName: "Supplier Note",
    cfdAcceptableRespType: "string",
    cfdSlug: getSlug("frm__lbl__supplier_note"),
  },
];

const dtCampaignFieldDescriptor: MdCampaignFieldDescriptor[] = [
  ...dtCampaignRecords, ...dtVendorRecords, ...dtSupplierRecords,
];

export default dtCampaignFieldDescriptor;
