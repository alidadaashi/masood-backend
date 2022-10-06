import { Transaction } from "knex";
import {
  oldDbSettingsRelevantInNewDb, supplierPrivilegesToMapInNewDb, tblNameOldDbCompanySettings,
  tblNameOldDbSupplier, tblNameOldDbSupplierPrivileges, tblNameOldDbSupplierUser, tblNameOldDbVendor,
  tblNameOldDbVendorPrivileges, tblNameOldDbVendorUser, vendorPrivilegesToMapInNewDb,
} from "../data/dtMigration";
import {
  tpOldDbSupplierPrivileges, tpOldDbVendorPrivileges, tpTblOldDbCompanySettings,
  tpTblOldDbSupplier, tpTblOldDbSupplierUser, tpTblOldDbVendor, tpTblOldDbVendorUser,
} from "../tpOldDb";

export const utUpdateOldSupplierIsSyncStatus = async (
  trxOldDb: Transaction,
  suppliers: tpTblOldDbSupplier[],
): Promise<void> => {
  await trxOldDb<tpTblOldDbSupplier>(tblNameOldDbSupplier).update({
    ref_is_synced: true,
  }).whereIn("sp_id", suppliers.map((supplier) => supplier.sp_id));
};

export const utUpdateOldVendorsIsSyncStatus = async (
  trxOldDb: Transaction,
  vendors: tpTblOldDbVendor[],
): Promise<void> => {
  await trxOldDb<tpTblOldDbVendor>(tblNameOldDbVendor).update({
    ref_is_synced: true,
  }).whereIn("vd_id", vendors.map((vendor) => vendor.vd_id));
};

export const utUpdateOldVendorUsersIsSyncStatus = async (
  trxOldDb: Transaction,
  vendorUsers: tpTblOldDbVendorUser[],
): Promise<void> => {
  await trxOldDb<tpTblOldDbVendorUser>(tblNameOldDbVendorUser).update({
    ref_is_synced: true,
  }).whereIn("vusr_id", vendorUsers.map((vuser) => vuser.vusr_id));
};

export const utUpdateOldSupplierUsersIsSyncStatus = async (
  trxOldDb: Transaction,
  supplierUsers: tpTblOldDbSupplierUser[],
): Promise<void> => {
  await trxOldDb<tpTblOldDbSupplierUser>(tblNameOldDbSupplierUser).update({
    ref_is_synced: true,
  }).whereIn("susr_id", supplierUsers.map((suser) => suser.susr_id));
};

export const utUpdateOldCompanySettingsIsSyncStatus = async (
  trxOldDb: Transaction,
  vendorId: string,
): Promise<void> => {
  await trxOldDb<tpTblOldDbCompanySettings>(tblNameOldDbCompanySettings).update({
    ref_is_synced: true,
  }).where("cs_vd_id", vendorId)
    .whereIn("cs_refer_name", oldDbSettingsRelevantInNewDb);
};

export const utUpdateOldVendorPrivilegesIsSyncStatus = async (
  trxOldDb: Transaction,
  userId: string,
): Promise<void> => {
  await trxOldDb<tpOldDbVendorPrivileges>(tblNameOldDbVendorPrivileges).update({
    ref_is_synced: true,
  }).where("vpriv_vusr_id", userId)
    .whereIn("vpriv_privilege", vendorPrivilegesToMapInNewDb);
};

export const utUpdateOldSupplierPrivilegesIsSyncStatus = async (
  trxOldDb: Transaction,
  userId: string,
): Promise<void> => {
  await trxOldDb<tpOldDbSupplierPrivileges>(tblNameOldDbSupplierPrivileges).update({
    ref_is_synced: true,
  }).where("spriv_susr_id", userId)
    .whereIn("spriv_privilege", supplierPrivilegesToMapInNewDb);
};
