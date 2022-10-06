import MdCampaignRecord from "../../campaign/campaignRecord/mdCampaignRecord";
import MdPages from "../../pages/mdPages";
import MdModule from "../../privilege/module/mdModule";

export const MODULE_TYPE_I18N = "i18n";

export const COL_IS_HAS_MULTIPLE_IMP_ALIAS = "mi";
export const COL_IS_OVERRIDDEN_ALIAS = "ov";
export const COL_IS_DYNAMIC_ALIAS = "dd";
export const COL_LOCKED_ALIAS = "l";

export const COL_SLG_ID_ALIAS = "slugId";
export const COL_SLG_TYPE_ALIAS = "slugType";
export const COL_SLG_ALIAS = "slug";

export const COL_SLG_ACTIVE_STATUS = "active";
export const COL_SLG_LOCKED_STATUS = "locked";

export const COL_TRANS_ROW_TYPE = "Type";
export const COL_TRANS_ROW_OVERRIDE_TYPE = "OverrideType";

export const COL_TRANS_ROW_OVERRIDE_DD = "dd";
export const COL_TRANS_ROW_OVERRIDE_OV = "ov";
export const COL_TRANS_ROW_OVERRIDE_L = "l";
export const COL_TRANS_ROW_OVERRIDE_MI = "mi";

export const COL_TRANS_ROW_MODULE_NAME = MdModule.col("mModuleName", false);
export const COL_TRANS_ROW_PAGE_NAME = MdPages.col("pgName", false);

export const COL_TRANS_ROW_CAMPAIGN_ID = MdCampaignRecord.col("crId", false);

export const COL_TRANS_ROW_DYNAMIC_ITEM_TYPE = "dynamicItemType";
export const COL_TRANS_ROW_DYNAMIC_ITEM_ID = "dynamicItemId";
export const COL_TRANS_ROW_I18N_ROUTE = "i18nRouteName";
export const COL_TRANS_ROW_INST_ID = "instanceId";
export const COL_TRANS_ROW_INST_NAME = "instance";

export const I18N_MAIN_ROUTE = "/i18n-main";
export const I18N_MP_ROUTE = "/i18n-multiple-implementations";
export const I18N_DYNAMIC_ROUTE = "/i18n-dynamic-trans";
