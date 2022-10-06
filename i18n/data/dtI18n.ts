import { dtPgSlgFooter } from "./pageSlug/dtPgSlgFooter";
import { dtPgSlgPreferences } from "./pageSlug/dtPgSlgPreferences";
import { dtPgSlgInstanceSettings } from "./pageSlug/dtPgSlgInstanceSettings";
import { dtPgSlgSetting } from "./pageSlug/dtPgSlgSetting";
import { dtPgSlgI18n } from "./pageSlug/dtPgSlgI18n";
import { dtPgSlgEntityUser } from "./pageSlug/dtPgSlgEntityUser";
import { dtPgSlgEntityGroup } from "./pageSlug/dtPgSlgEntityGroup";
import { dtPgSlgEntityDomain } from "./pageSlug/dtPgSlgEntityDomain";
import { dtPgSlgUserPrivileges } from "./pageSlug/dtPgSlgUserPrivileges";
import { dtTransPage } from "./slugTranslations/dtTransPage";
import { dtTransForm } from "./slugTranslations/dtTransForm";
import { dtTransToolbar } from "./slugTranslations/dtTransToolbar";
import { dtTransMisc } from "./slugTranslations/dtTransMisc";
import { dtTransTable } from "./slugTranslations/dtTransTable";
import { tpTransType } from "../types/tpI18n";
import { dtTransHeader } from "./slugTranslations/dtTransHeader";
import { dtTransFooter } from "./slugTranslations/dtTransFooter";
import { dtTransDrawer } from "./slugTranslations/dtTransDrawer";
import { dtPgSlgDrawer } from "./pageSlug/dtPgSlgDrawer";
import { dtPgSlgHeader } from "./pageSlug/dtPgSlgHeader";
import { dtPgSlgProfile } from "./pageSlug/dtPgSlgProfile";
import { dtPgSlgRole } from "./pageSlug/dtPgSlgRole";
import { dtTransAuth } from "./slugTranslations/dtTransAuth";
import { dtAllSludges } from "./dtSludges";
import { dtPgSlgFilter } from "./pageSlug/dtPgSlgFilter";
import { dtPgSlgLogin } from "./pageSlug/dtPgSlgLogin";
import { dtPgSlgAdmin } from "./pageSlug/dtPgSlgAdmin";
import { dtTransProduct } from "./slugTranslations/dtTransProduct";
import { dtPgSlgProduct } from "./pageSlug/dtPgSlgProduct";
import { dtPgSlgDynamicTrans } from "./pageSlug/dtPgSlgDynamicTrans";
import { dtTransDynamic } from "./slugTranslations/dtTransDynamic";
import { dtPgSlgTheme } from "./pageSlug/dtPgSlgTheme";
// import { dtPgSlgCampaign } from "./pageSlug/dtPgSlgCampaign";
import { dtPgSlgSupplierCampaignList } from "./pageSlug/dtPgSlgSupplierCampaignList";
import { dtPgSlgSupplierCampaignDetail } from "./pageSlug/dtPgSlgSupplierCampaignDetail";
import { dtPgSlgVendorCampaignDetail } from "./pageSlug/dtPgSlgVendorCampaignDetail";
import { dtPgSlgVendorCampaignList } from "./pageSlug/dtPgSlgVendorCampaignList";
import { dtPgSlgVendorCampaignSummary } from "./pageSlug/dtPgSlgVendorCampaignSummary";
import { dtPgSlgAllNotifications } from "./pageSlug/dtPgSlgAllNotifications";
import { dtPgSlgDocument } from "./pageSlug/dtPgSlgDocument";
import { dtPgSlgAttachment } from "./pageSlug/dtPgSlgAttachment";
import { dtPgSlgDocumentUserParamter } from "./pageSlug/dtPgSlgDocumentUserParamter";
import { dtPgSlgStickyNotes } from "./pageSlug/dtPgSlgStickyNotes";
import { dtPgSlgNotes } from "./pageSlug/dtPgSlgNotes";

export const dtAllTranslations: tpTransType<typeof dtAllSludges> = {
  ...dtTransHeader,
  ...dtTransDrawer,
  ...dtTransTable,
  ...dtTransMisc,
  ...dtTransToolbar,
  ...dtTransForm,
  ...dtTransPage,
  ...dtTransAuth,
  ...dtTransProduct,
  ...dtTransDynamic,
  ...dtTransFooter,
};

export const dtI18nSchema = {
  main: {
    drawer: dtPgSlgDrawer,
    stickyNotes: dtPgSlgStickyNotes,
    header: dtPgSlgHeader,
    filter: dtPgSlgFilter,
    profile: dtPgSlgProfile,
    role: dtPgSlgRole,
    userPrivileges: dtPgSlgUserPrivileges,
    entityDomain: dtPgSlgEntityDomain,
    entityGroup: dtPgSlgEntityGroup,
    entityUser: dtPgSlgEntityUser,
    i18n: dtPgSlgI18n,
    setting: dtPgSlgSetting,
    admin: dtPgSlgAdmin,
    products: dtPgSlgProduct,
    dynamic: dtPgSlgDynamicTrans,
    theme: dtPgSlgTheme,
    preferences: dtPgSlgPreferences,
    instanceSettings: dtPgSlgInstanceSettings,
    // campaign: dtPgSlgCampaign,
    footer: dtPgSlgFooter,
    supplierCampaignList: dtPgSlgSupplierCampaignList,
    supplierCampaignDetail: dtPgSlgSupplierCampaignDetail,
    vendorCampaignDetail: dtPgSlgVendorCampaignDetail,
    vendorCampaignList: dtPgSlgVendorCampaignList,
    vendorCampaignSummary: dtPgSlgVendorCampaignSummary,
    document: dtPgSlgDocument,
    notes: dtPgSlgNotes,
    attachment: dtPgSlgAttachment,
    documentUserParamter: dtPgSlgDocumentUserParamter,
    allNotifications: dtPgSlgAllNotifications
  },
  auth: {
    login: dtPgSlgLogin,
  },
};
