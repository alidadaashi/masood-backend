import MdEntity from "../../../module/entity/mdEntity";
import MdDomainDetails from "../../../module/entities/domain/mdDomainDetails";
import { defaultUserPreferences } from "../../../module/shared/data/dtUserPreferences";
import { AppEnv } from "../../../base/loaders/cfgBaseLoader";

export const tblNameOldDbVendor = "vendor";
export const tblNameOldDbVendorUser = "vuser";
export const tblNameOldDbSupplier = "supplier";
export const tblNameOldDbSupplierUser = "suser";
export const tblNameOldDbCompanyRel = "company_rel";
export const tblNameOldDbCompanySettings = "company_settings";
export const tblNameOldDbVendorSuserRel = "suser_vd_relation";
export const tblNameOldDbVendorPrivileges = "vendor_privileges";
export const tblNameOldDbSupplierPrivileges = "supp_privileges";

export const oldDbNumberFormatPrefName = "USE_COMMA_AS_DECIMAL_SEPERATOR";
export const oldDbQuantityScalePrefName = "QUANTITY_SCALE";
export const oldDbPriceScalePrefName = "PRICE_SCALE";
export const oldDbPercentageScalePrefName = "PERCENTAGE_SCALE";

export const oldDbSettingsRelevantInNewDb = [
  oldDbNumberFormatPrefName, oldDbQuantityScalePrefName, oldDbPriceScalePrefName, oldDbPercentageScalePrefName,
];

export const vendorIdsToMigrate = AppEnv.oldDbVendorIdsToMigrate;

export const testVendorUserId = "50162";

export const dtDummyDomain: MdEntity = {
  entityId: "8727c385-47b2-42a3-aa8d-2cf07c6ce8d9",
  entityType: "domain",
  entityStatus: "inactive",
};

export const dtDummyDomainDetails: MdDomainDetails = {
  dId: "252c7953-da73-4713-ac45-5814999347f9",
  dEntityId: dtDummyDomain.entityId as string,
  dName: "Dummy Domain",
};

export const defaultVendorSettings = {
  priceScale: defaultUserPreferences.uPrcDecRng,
  numberFormat: defaultUserPreferences.numFmt,
  quantityScale: defaultUserPreferences.qtyDecRng,
  percentageScale: defaultUserPreferences.pctDecRng,
};

export const vendorPrivilegesToMapInNewDb = [
  "ADMIN_CREATE_SUPPLIER",
  "ADMIN_SUPPINFO_EDIT",
  "ADMIN_SUPPINFO_VIEW",
  "ADMIN_PRIVILECLASSES_VIEW_EDIT",
  "ADMIN_USERINFO_EDIT",
  "ADMIN_USERINFO_VIEW",
];

export const supplierPrivilegesToMapInNewDb = [
  "ADMIN_PRIVILECLASSES_VIEW_EDIT",
  "ADMIN_USERINFO_EDIT",
  "ADMIN_USERINFO_VIEW",
];
