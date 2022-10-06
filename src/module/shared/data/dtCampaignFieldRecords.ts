const dtDummyCampaignVendorRecs = [
  {
    "Department Code": "#0090",
    "Department Definition": "Test Def 1",
    "Goods Group Code": "123",
    "Goods Group Description": "Lorem Ipsum",
    "Item No.": "9993",
    "Product description": "Apple",
    Barcode: "ANCIZP",
    Seller: "Test",
    "Seller Description": "Lorem Ipsum",
    "Material Condition": "Lorem Ipsum",
    VAT: "54",
    "Is the Site Open?": "false",
    "Is Shipping Free?": "false",
    "Status Code": "123",
    "Cargo Integration Status": "0",
    "Cargo Company": "Test",
    desi: "None",
    "Shipping cost": "$665",
    "PB00 (Purchase Price)": "$33",
    "VKP0 (Desk Sales Price)": "$33",
    "PA00 (Campaign Purchase Price)": "$34",
    "VKZ1 (Campaign Selling Price)": "$33",
    "Current Purchase Price": "$45",
    "Current Sale Price": "$54",
    "Purchase End Date with Campaign (PA00)": "03-03-2022",
    "Campaign Sale End Date (VZK1)": "03-03-2022",
    "Department Real Margin": "$23",
    "Campaign Real Margin": "$44",
    "Max. Sales Price that can be entered": "$111",
    "Current Campaign Margin": "$23",
    "Current Campaign Real Margin": "$23",
    "Recommendation Purchase Price Discount Rate (%)": "",
    "Suggestion Purchase Price": "",
    "Confirmed Purchase Price": "",
    "Valid Selling Price": "",
    "Category Comment": "",
    "Hero Evaluation Result": "",
    "Main Firm Note": "",
  },
  {
    "Department Code": "#0091",
    "Department Definition": "Test Def 2",
    "Goods Group Code": "",
    "Goods Group Description": "Lorem Ipsum 1",
    "Item No.": "9993",
    "Product description": "Cherry",
    Barcode: "LRFDF",
    Seller: "",
    "Seller Description": "",
    "Material Condition": "",
    VAT: "54",
    "Is the Site Open?": "false",
    "Is Shipping Free?": "true",
    "Status Code": "",
    "Cargo Integration Status": "1",
    "Cargo Company": "",
    desi: "None",
    "Shipping cost": "$161",
    "PB00 (Purchase Price)": "$34",
    "VKP0 (Desk Sales Price)": "$66",
    "PA00 (Campaign Purchase Price)": "$664",
    "VKZ1 (Campaign Selling Price)": "$232",
    "Current Purchase Price": "#33",
    "Current Sale Price": "#66",
    "Purchase End Date with Campaign (PA00)": "02-02-2022",
    "Campaign Sale End Date (VZK1)": "02-03-2022",
    "Department Real Margin": "Nill",
    "Campaign Real Margin": "Yes",
    "Max. Sales Price that can be entered": "",
    "Current Campaign Margin": "",
    "Current Campaign Real Margin": "",
    "Recommendation Purchase Price Discount Rate (%)": "",
    "Suggestion Purchase Price": "",
    "Confirmed Purchase Price": "",
    "Valid Selling Price": "",
    "Category Comment": "",
    "Hero Evaluation Result": "",
    "Main Firm Note": "",
  },
];

const dtDummyCampaignSuppRecs = [
  {
    "Campaign Participation": "",
    "Hero Suggestion": "",
    "Discount Type": "",
    "Discount Rate over Purchase Price": "",
    "Discounted Purchase Price Amount": "",
    "Recommended Campaign Sales Price": "",
    "Supplier Note": "",
  },
  {
    "Campaign Participation": "",
    "Hero Suggestion": "",
    "Discount Type": "",
    "Discount Rate over Purchase Price": "",
    "Discounted Purchase Price Amount": "",
    "Recommended Campaign Sales Price": "",
    "Supplier Note": "",
  },
];

export const dtDummyCampaignRecords = [
  {
    ...dtDummyCampaignVendorRecs[0],
    ...dtDummyCampaignSuppRecs[0],
  },
  {
    ...dtDummyCampaignVendorRecs[1],
    ...dtDummyCampaignSuppRecs[1],
  },
];

const dtCampaignEditableFieldsSupp = {
  "Campaign Participation": { editableBySupp: true, editableByInstance: false },
  "Hero Suggestion": { editableBySupp: true, editableByInstance: false },
  "Discount Type": { editableBySupp: true, editableByInstance: false },
  "Discount Rate over Purchase Price": { editableBySupp: true, editableByInstance: false },
  "Discounted Purchase Price Amount": { editableBySupp: true, editableByInstance: false },
  "Recommended Campaign Sales Price": { editableBySupp: true, editableByInstance: false },
  "Supplier Note": { editableBySupp: true, editableByInstance: false },
};

export const dtCampaignSupplierEditableFieldsSlug = [
  "frm__lbl__campaign_participation",
  "frm__lbl__suggestion",
  "frm__lbl__discount_type",
  "frm__lbl__discount_rate_over_purchase_price",
  "frm__lbl__discounted_purchase_price_amount",
  "frm__lbl__recommended_campaign_sales_price",
  "frm__lbl__supplier_note",
];

export const dtCampaignVendorEditableFieldsSlug = [
  "frm__lbl__recommendation_purchase_price_discount_rate",
  "frm__lbl__suggestion_purchase_price",
  "frm__lbl__confirmed_purchase_price",
  "frm__lbl__valid_selling_price",
  "frm__lbl__category_comment",
  "frm__lbl__hero_evaluation_result",
  "frm__lbl__main_firm_note",
];

const dtCampaignEditableFieldsVendor = {
  Status: { editableBySupp: false, editableByInstance: false },
  "Department Code": { editableBySupp: false, editableByInstance: false },
  "Department Definition": { editableBySupp: false, editableByInstance: false },
  "Goods Group Code": { editableBySupp: false, editableByInstance: false },
  "Goods Group Description": { editableBySupp: false, editableByInstance: false },
  "Item No.": { editableBySupp: false, editableByInstance: false },
  "Product description": { editableBySupp: false, editableByInstance: false },
  Barcode: { editableBySupp: false, editableByInstance: false },
  Seller: { editableBySupp: false, editableByInstance: false },
  "Seller Description": { editableBySupp: false, editableByInstance: false },
  "Material Condition": { editableBySupp: false, editableByInstance: false },
  VAT: { editableBySupp: false, editableByInstance: false },
  "Is the Site Open?": { editableBySupp: false, editableByInstance: false },
  "Is Shipping Free?": { editableBySupp: false, editableByInstance: false },
  "Status Code": { editableBySupp: false, editableByInstance: false },
  "Cargo Integration Status": { editableBySupp: false, editableByInstance: false },
  "Cargo Company": { editableBySupp: false, editableByInstance: false },
  desi: { editableBySupp: false, editableByInstance: false },
  "Shipping cost": { editableBySupp: false, editableByInstance: false },
  "PB00 (Purchase Price)": { editableBySupp: false, editableByInstance: false },
  "VKP0 (Desk Sales Price)": { editableBySupp: false, editableByInstance: false },
  "PA00 (Campaign Purchase Price)": { editableBySupp: false, editableByInstance: false },
  "VKZ1 (Campaign Selling Price)": { editableBySupp: false, editableByInstance: false },
  "Current Purchase Price": { editableBySupp: false, editableByInstance: false },
  "Current Sale Price": { editableBySupp: false, editableByInstance: false },
  "Purchase End Date with Campaign (PA00)": { editableBySupp: false, editableByInstance: false },
  "Campaign Sale End Date (VZK1)": { editableBySupp: false, editableByInstance: false },
  "Department Real Margin": { editableBySupp: false, editableByInstance: false },
  "Campaign Real Margin": { editableBySupp: false, editableByInstance: false },
  "Max. Sales Price that can be entered": { editableBySupp: false, editableByInstance: false },
  "Current Campaign Margin": { editableBySupp: false, editableByInstance: false },
  "Current Campaign Real Margin": { editableBySupp: false, editableByInstance: false },
  "Recommendation Purchase Price Discount Rate (%)": { editableBySupp: false, editableByInstance: true },
  "Suggestion Purchase Price": { editableBySupp: false, editableByInstance: true },
  "Confirmed Purchase Price": { editableBySupp: false, editableByInstance: true },
  "Valid Selling Price": { editableBySupp: false, editableByInstance: true },
  "Category Comment": { editableBySupp: false, editableByInstance: true },
  "Hero Evaluation Result": { editableBySupp: false, editableByInstance: true },
  "Main Firm Note": { editableBySupp: false, editableByInstance: true },
};

export const dtCampaignEditableFields: Record<
  (keyof typeof dtDummyCampaignRecords[number]) | string,
  { editableBySupp: boolean, editableByInstance: boolean }
> = {
  ...dtCampaignEditableFieldsSupp,
  ...dtCampaignEditableFieldsVendor,
};

export const CAMP_DETAIL_CATEGORY_COMMENT_FIELD_DESC_ID = "7a553e47-cab2-4ac6-8dd2-4d5b519f22c6";
export const CAMP_DETAIL_PROD_STATUS_FIELD_DESC_ID = "11af0983-defe-44fb-b548-72722ed46171";
export const CAMPAIGN_DETAIL_PROD_STATUS_APPROVED = "Onayla";
export const CAMPAIGN_DETAIL_PROD_STATUS_REJECT = "Reddet";
export const CAMPAIGN_DETAIL_PROD_STATUS_REVISION_REQ = "Revize İste";
export const CAMP_DETAIL_STATUS_FIELD_INITIAL_VAL = "Açık";

export const CAMPAIGN_STATUS_SUBMIT_FOR_APPROVAL = "Submit for Approval";
export const CAMPAIGN_STATUS_WITHDRAW_FROM_APPROVAL = "Withdraw From Approval";
export const CAMPAIGN_STATUS_NEW = "New";
export const CAMPAIGN_STATUS_VIEWED = "Viewed";
export const CAMPAIGN_STATUS_CONFIRM = "Confirm";

export const RECOMMENDATION_PURCHASE_PRICE_DISCOUNT_RATE_ID = "4d9782be-3cb0-4ecb-bb43-9827b074883b";
export const SUGGESTION_PURCHASE_PRICE_ID = "bdbd81ee-f9ba-4e00-aee2-26ccedeb0e99";
export const CONFIRMED_PURCHASE_PRICE_ID = "4ddc0774-9b44-4ca6-8359-1b38cc401909";
export const VALID_SELLING_PRICE_ID = "d97b9de4-a9c2-4e18-91a5-9ca45af6d7b0";
export const CATEGORY_COMMENT_ID = "7a553e47-cab2-4ac6-8dd2-4d5b519f22c6";
export const HERO_EVALUATION_RESULT_ID = "4395d96e-8256-439b-8624-650798f81fd2";
export const CAMPAIGN_PARTICIPATION_ID = "e7918dc0-48cc-4f58-97c0-1cc27e9fafc3";
export const SUGGESTION_ID = "c380427e-8873-4d96-b488-7043045ed065";
export const DISCOUNT_TYPE_ID = "c8d60a9d-0cc2-4160-8d7c-5a76a199daec";
export const DISCOUNT_RATE_OVER_PURCHASE_PRICE_ID = "6ea15024-ce09-43da-a9da-63529ad1c5cf";
export const DISCOUNTED_PURCHASE_PRICE_AMOUNT_ID = "70d035ae-36d5-46af-bf13-271d2ffaafc6";
export const RECOMMENDED_CAMPAIGN_SALES_PRICE_ID = "56d2bbab-0982-4b44-9c71-1418d92fdcda";

export const dtAllRequiredFieldsKeysForVendor = [
  RECOMMENDATION_PURCHASE_PRICE_DISCOUNT_RATE_ID, SUGGESTION_PURCHASE_PRICE_ID, CONFIRMED_PURCHASE_PRICE_ID,
  VALID_SELLING_PRICE_ID, CATEGORY_COMMENT_ID, HERO_EVALUATION_RESULT_ID,
];

export const dtAllRequiredFieldsKeysForSupplier = [
  CAMPAIGN_PARTICIPATION_ID, SUGGESTION_ID, DISCOUNT_TYPE_ID, DISCOUNT_RATE_OVER_PURCHASE_PRICE_ID,
  DISCOUNTED_PURCHASE_PRICE_AMOUNT_ID, RECOMMENDED_CAMPAIGN_SALES_PRICE_ID,
];

export const dtCampaignEditableDecimalNumericFieldsIds = [
  RECOMMENDATION_PURCHASE_PRICE_DISCOUNT_RATE_ID, SUGGESTION_PURCHASE_PRICE_ID, CONFIRMED_PURCHASE_PRICE_ID,
  VALID_SELLING_PRICE_ID, DISCOUNT_RATE_OVER_PURCHASE_PRICE_ID,
  DISCOUNTED_PURCHASE_PRICE_AMOUNT_ID, RECOMMENDED_CAMPAIGN_SALES_PRICE_ID,
];
