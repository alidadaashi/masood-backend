import { QueryBuilder, Transaction } from "knex";
import {
  oldDbSettingsRelevantInNewDb, supplierPrivilegesToMapInNewDb, tblNameOldDbCompanyRel,
  tblNameOldDbCompanySettings, tblNameOldDbSupplier, tblNameOldDbSupplierPrivileges,
  tblNameOldDbSupplierUser, tblNameOldDbVendor, tblNameOldDbVendorPrivileges,
  tblNameOldDbVendorSuserRel, tblNameOldDbVendorUser, vendorIdsToMigrate, vendorPrivilegesToMapInNewDb,
} from "../data/dtMigration";
import {
  tpOldDbSupplierPrivileges, tpOldDbVendorPrivileges,
  tpOldDbVendorSuserRel, tpTblOldDbCompanyRel, tpTblOldDbCompanySettings, tpTblOldDbSupplier,
  tpTblOldDbSupplierUser, tpTblOldDbVendor, tpTblOldDbVendorUser,
} from "../tpOldDb";

export const doGetOldDbAllVendors = async (
  oldDbTrx: Transaction,
): Promise<tpTblOldDbVendor[]> => oldDbTrx<tpTblOldDbVendor>(tblNameOldDbVendor)
  .select(["vd_id", "vd_name", "ref_updated_date", "ref_is_synced"])
  .whereIn("vd_id", vendorIdsToMigrate);

export const doGetOldDbVendor = async (
  oldDbTrx: Transaction,
  vendorId: string,
): Promise<tpTblOldDbVendor | undefined> => oldDbTrx<tpTblOldDbVendor>(tblNameOldDbVendor)
  .select(["vd_id", "vd_name", "ref_updated_date", "ref_is_synced"])
  .where("vd_id", vendorId)
  .first();

export const doGetOldDbVendorSettings = async (
  oldDbTrx: Transaction,
  vendorId: string,
  referName: string,
): Promise<tpTblOldDbCompanySettings | undefined> => oldDbTrx<tpTblOldDbCompanySettings>(tblNameOldDbCompanySettings)
  .select(["cs_vd_id", "cs_sp_id", "cs_refer_name", "cs_value", "ref_updated_date", "ref_is_synced"])
  .where("cs_vd_id", vendorId).andWhere("cs_refer_name", referName)
  .first();

export const doGetOldDbVendorUsers = async (
  oldDbTrx: Transaction,
  vendorId: string,
): Promise<tpTblOldDbVendorUser[]> => oldDbTrx<tpTblOldDbVendorUser>(tblNameOldDbVendorUser)
  .select(["vusr_id", "vusr_vd_id", "vusr_name", "vusr_email", "vusr_password", "vusr_dateformat", "vusr_timezone",
    "vusr_lines_per_page", "vusr_language", "vusr_privileges", "ref_updated_date", "ref_is_synced"])
  .where("vusr_vd_id", vendorId);

export const doGetOldDbVendorSuppliers = (
  oldDbTrx: Transaction, vendorId: string,
): Promise<Pick<tpTblOldDbCompanyRel & tpTblOldDbSupplier,
  "sp_id" | "sp_name" | "sp_creation_date">[]> => oldDbTrx<tpTblOldDbCompanyRel & tpTblOldDbSupplier>(tblNameOldDbCompanyRel)
  .select(["sp_id", "sp_name", "sp_creation_date"])
  .join(tblNameOldDbSupplier, {
    sp_id: "com_sp_id",
  } as Record<keyof tpTblOldDbSupplier, keyof tpTblOldDbCompanyRel>)
  .where("com_vd_id", vendorId);

export const doGetOldDbSupplierUsers = async (
  oldDbTrx: Transaction,
  supplierId: string,
): Promise<tpTblOldDbSupplierUser[]> => oldDbTrx<tpTblOldDbSupplierUser>(tblNameOldDbSupplierUser)
  .select(["susr_id", "susr_sp_id", "susr_name", "susr_email", "susr_password", "susr_dateformat", "susr_timezone",
    "susr_lines_per_page", "susr_language", "susr_privileges", "ref_updated_date", "ref_is_synced"])
  .where("susr_sp_id", supplierId);

export const doGetOldDbUnSyncedVendors = (
  oldDbTrx: Transaction,
): Promise<tpTblOldDbVendor[]> => oldDbTrx<tpTblOldDbVendor>(tblNameOldDbVendor)
  .select(["vd_id", "vd_name", "ref_updated_date", "ref_is_synced"])
  .whereIn("vd_id", vendorIdsToMigrate)
  .where({ ref_is_synced: false } as tpTblOldDbVendor);

export const doGetOldDbUnSyncedVendorUsers = (
  oldDbTrx: Transaction,
): Promise<tpTblOldDbVendorUser[]> => oldDbTrx<tpTblOldDbVendorUser>(tblNameOldDbVendorUser)
  .select(["vusr_id", "vusr_vd_id", "vusr_name", "vusr_email", "vusr_password", "vusr_dateformat", "vusr_timezone",
    "vusr_lines_per_page", "vusr_language", "vusr_privileges", "ref_updated_date", "ref_is_synced"])
  .whereIn("vusr_vd_id", vendorIdsToMigrate)
  .where({ ref_is_synced: false } as tpTblOldDbVendorUser);

export const doGetOldDbUnSyncedVendorSuppliers = (
  oldDbTrx: Transaction,
): Promise<Pick<
  tpTblOldDbCompanyRel & tpTblOldDbSupplier, "sp_id" | "sp_name" | "sp_creation_date" | "com_vd_id">[]
> => oldDbTrx<tpTblOldDbCompanyRel & tpTblOldDbSupplier>(tblNameOldDbCompanyRel)
  .select(["sp_id", "sp_name", "sp_creation_date"])
  .join(tblNameOldDbSupplier, {
    sp_id: "com_sp_id",
  } as Record<keyof tpTblOldDbSupplier, keyof tpTblOldDbCompanyRel>)
  .whereIn("com_vd_id", vendorIdsToMigrate)
  .where({ ref_is_synced: false } as tpTblOldDbSupplier);

const doGetOldDbSupplierUsersForVendorIdsToMigrate = (
  oldDbTrx: Transaction,
): Promise<Pick<tpOldDbVendorSuserRel, "suvr_susr_id">[]> => oldDbTrx<tpOldDbVendorSuserRel>(tblNameOldDbVendorSuserRel)
  .select(["suvr_susr_id"])
  .whereIn("suvr_vd_id", vendorIdsToMigrate);

const doGetOldDbVendorUsersForVendorIdsToMigrate = (
  oldDbTrx: Transaction,
): Promise<Pick<tpTblOldDbVendorUser, "vusr_id">[]> => oldDbTrx<tpTblOldDbVendorUser>(tblNameOldDbVendorUser)
  .select(["vusr_id"])
  .whereIn("vusr_vd_id", vendorIdsToMigrate);

export const doGetOldDbUnSyncedSupplierUsers = (
  oldDbTrx: Transaction,
): Promise<tpTblOldDbSupplierUser[]> => oldDbTrx<tpTblOldDbSupplierUser>(tblNameOldDbSupplierUser)
  .select(["susr_id", "susr_sp_id", "susr_name", "susr_email", "susr_password", "susr_dateformat", "susr_timezone",
    "susr_lines_per_page", "susr_language", "susr_privileges", "ref_updated_date", "ref_is_synced"])
  .whereIn("susr_id", (doGetOldDbSupplierUsersForVendorIdsToMigrate(oldDbTrx) as QueryBuilder))
  .where({ ref_is_synced: false } as tpTblOldDbSupplierUser);

export const doGetOldDbUnSyncedVendorSettings = (
  oldDbTrx: Transaction,
): Promise<tpTblOldDbCompanySettings[]> => oldDbTrx<tpTblOldDbCompanySettings>(tblNameOldDbCompanySettings)
  .select(["cs_vd_id", "cs_sp_id", "cs_refer_name", "cs_value", "ref_updated_date", "ref_is_synced"])
  .whereIn("cs_vd_id", vendorIdsToMigrate)
  .whereIn("cs_refer_name", oldDbSettingsRelevantInNewDb)
  .where({ ref_is_synced: false } as tpTblOldDbCompanySettings);

export const doGetOldDbVendorBySupplierUser = (
  oldDbTrx: Transaction, suserId: string,
): Promise<tpOldDbVendorSuserRel | undefined> => oldDbTrx<tpOldDbVendorSuserRel>(tblNameOldDbVendorSuserRel)
  .select(["suvr_vd_id", "suvr_sp_id", "suvr_susr_id", "suvr_id"])
  .where("suvr_susr_id", suserId).first();

export const doGetOldDbSupplierUsersByVendorId = (
  oldDbTrx: Transaction, vendorId: string,
): Promise<tpOldDbVendorSuserRel[]> => oldDbTrx<tpOldDbVendorSuserRel>(tblNameOldDbVendorSuserRel)
  .select(["suvr_vd_id", "suvr_sp_id", "suvr_susr_id", "suvr_id"])
  .where("suvr_vd_id", vendorId);

export const doGetOldDbVendorPrivilegesByVuserId = (
  oldDbTrx: Transaction, vuserId: string,
): Promise<Pick<tpOldDbVendorPrivileges, "vpriv_privilege">[]> => oldDbTrx<tpOldDbVendorPrivileges>(
  tblNameOldDbVendorPrivileges,
).select("vpriv_privilege")
  .whereIn("vpriv_privilege", vendorPrivilegesToMapInNewDb)
  .where("vpriv_vusr_id", vuserId);

export const doGetOldDbSupplierPrivilegesBySuserId = (
  oldDbTrx: Transaction, suserId: string,
): Promise<Pick<tpOldDbSupplierPrivileges, "spriv_privilege">[]> => oldDbTrx<tpOldDbSupplierPrivileges>(
  tblNameOldDbSupplierPrivileges,
)
  .select("spriv_privilege")
  .whereIn("spriv_privilege", supplierPrivilegesToMapInNewDb)
  .where("spriv_susr_id", suserId);

export const doGetOldDbUnSyncedVendorPrivileges = (
  oldDbTrx: Transaction,
): Promise<tpOldDbVendorPrivileges[]> => oldDbTrx<tpOldDbVendorPrivileges>(tblNameOldDbVendorPrivileges)
  .select(["vpriv_privilege", "vpriv_vusr_id", "ref_updated_date", "ref_is_synced"])
  .whereIn("vpriv_vusr_id", (doGetOldDbVendorUsersForVendorIdsToMigrate(oldDbTrx) as QueryBuilder))
  .whereIn("vpriv_privilege", vendorPrivilegesToMapInNewDb)
  .where({ ref_is_synced: false } as tpOldDbVendorPrivileges);

export const doGetOldDbUnSyncedSupplierPrivileges = (
  oldDbTrx: Transaction,
): Promise<tpOldDbSupplierPrivileges[]> => oldDbTrx<tpOldDbSupplierPrivileges>(tblNameOldDbSupplierPrivileges)
  .select(["spriv_privilege", "spriv_susr_id", "ref_updated_date", "ref_is_synced"])
  .whereIn("spriv_privilege", supplierPrivilegesToMapInNewDb)
  .whereIn("spriv_susr_id", (doGetOldDbSupplierUsersForVendorIdsToMigrate(oldDbTrx) as QueryBuilder))
  .where({ ref_is_synced: false } as tpOldDbSupplierPrivileges);

export const doGetOldDbVendorUserByUserId = (
  oldDbTrx: Transaction,
  userId: string,
): Promise<tpTblOldDbVendorUser | undefined> => oldDbTrx<tpTblOldDbVendorUser>(tblNameOldDbVendorUser)
  .select(["vusr_id", "vusr_vd_id", "vusr_name", "vusr_email", "vusr_password", "vusr_dateformat", "vusr_timezone",
    "vusr_lines_per_page", "vusr_language", "vusr_privileges", "ref_updated_date", "ref_is_synced"])
  .whereIn("vusr_vd_id", vendorIdsToMigrate)
  .where("vusr_id", userId)
  .first();

export const doGetOldDbSupplierUserByUserId = (
  oldDbTrx: Transaction,
  userId: string,
): Promise<tpTblOldDbSupplierUser | undefined> => oldDbTrx<tpTblOldDbSupplierUser>(tblNameOldDbSupplierUser)
  .select(["susr_id", "susr_sp_id", "susr_name", "susr_email", "susr_password", "susr_dateformat", "susr_timezone",
    "susr_lines_per_page", "susr_language", "susr_privileges", "ref_updated_date", "ref_is_synced"])
  .where("susr_id", userId)
  .whereIn("susr_id", (doGetOldDbSupplierUsersForVendorIdsToMigrate(oldDbTrx) as QueryBuilder))
  .first();
