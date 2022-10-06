import MdGroupDetails from "../../../module/entities/group/mdGroupDetails";
import {
  tpDummyDataForOldDb,
  tpTblOldDbCompanyRel, tpTblOldDbCompanySettings, tpTblOldDbSupplier,
  tpTblOldDbSupplierUser, tpTblOldDbVendor, tpTblOldDbVendorUser,
} from "../../dataMigration/tpOldDb";
import doGroupDetails from "../../../module/entities/group/doGroupDetails";
import {
  doGetOldDbAllVendors, doGetOldDbSupplierUsers, doGetOldDbVendorSuppliers, doGetOldDbVendorUsers,
} from "../../dataMigration/dao/doMigration";
import { srGetOldDbConnection, srGetNewDbConnection } from "../../dataMigration/srConnection";
import doEntityUser from "../../../module/entity/entityUser/doEntityUser";
import MdEntityUser from "../../../module/entity/entityUser/mdEntityUser";
import {
  tblNameOldDbCompanyRel,
  tblNameOldDbCompanySettings,
  tblNameOldDbSupplier, tblNameOldDbSupplierUser, tblNameOldDbVendor, tblNameOldDbVendorUser,
} from "../../dataMigration/data/dtMigration";
import doUserPreferences from "../../../module/preferences/userPreference/doUserPreferences";
import MdUserPreferences from "../../../module/preferences/userPreference/mdUserPreferences";

const oldDbConnection = srGetOldDbConnection();
export const newDbConnection = srGetNewDbConnection();

export const srGetAllVendorFromOldDb = async (): Promise<tpTblOldDbVendor[]> => {
  let vendors: tpTblOldDbVendor[] = [];
  await oldDbConnection.transaction(async (trxOldDb) => {
    vendors = await doGetOldDbAllVendors(trxOldDb);
  });
  return vendors;
};

export const srGetVendorUsersFromOldDb = async (): Promise<[tpTblOldDbVendorUser[], string]> => {
  let vendorUser: tpTblOldDbVendorUser[] = [];
  let vendors: tpTblOldDbVendor[] = [];
  let randomIndex = 0;
  await oldDbConnection.transaction(async (trxOldDb) => {
    vendors = await doGetOldDbAllVendors(trxOldDb);
    randomIndex = Math.floor(Math.random() * vendors.length) + 1;
    vendorUser = await doGetOldDbVendorUsers(trxOldDb, vendors[randomIndex].vd_id);
  });
  return [vendorUser, vendors[randomIndex].vd_id];
};

export const srGetVendorSuppliersFromOldDb = async (): Promise<Pick<tpTblOldDbCompanyRel & tpTblOldDbSupplier,
  "sp_id" | "sp_name" | "sp_creation_date">[]> => {
  let vendorSuppliers: Pick<tpTblOldDbCompanyRel & tpTblOldDbSupplier, "sp_id" | "sp_name" | "sp_creation_date">[] = [];
  let vendors: tpTblOldDbVendor[] = [];
  let randomIndex = 0;
  await oldDbConnection.transaction(async (trxOldDb) => {
    vendors = await doGetOldDbAllVendors(trxOldDb);
    randomIndex = Math.floor(Math.random() * vendors.length);
    vendorSuppliers = await doGetOldDbVendorSuppliers(trxOldDb, vendors[randomIndex].vd_id);
  });
  return vendorSuppliers;
};

export const srGetSupplierUsersFromOldDb = async (): Promise<[tpTblOldDbSupplierUser[], string]> => {
  let supplierUser: tpTblOldDbSupplierUser[] = [];
  let suppliers: Pick<tpTblOldDbCompanyRel & tpTblOldDbSupplier,
    "sp_id" | "sp_name" | "sp_creation_date">[] = [];
  let randomIndex = 0;
  await oldDbConnection.transaction(async (trxOldDb) => {
    suppliers = await srGetVendorSuppliersFromOldDb();
    randomIndex = Math.floor(Math.random() * suppliers.length);
    supplierUser = await doGetOldDbSupplierUsers(trxOldDb, suppliers[randomIndex].sp_id);
  });
  return [supplierUser, suppliers[randomIndex].sp_id];
};

export const srGetAllVendorFromNewDb = async (): Promise<MdGroupDetails[]> => {
  let vendors: MdGroupDetails[] = [];
  await newDbConnection.transaction(async (trxNewDb) => {
    vendors = await doGroupDetails.getAll(trxNewDb);
  });
  return vendors;
};

export const srGetSyncedVendorOrSupplierFromNewDb = async (vendorIds: string[]): Promise<MdGroupDetails[]> => {
  let vendors: MdGroupDetails[] = [];
  await newDbConnection.transaction(async (trxNewDb) => {
    vendors = await doGroupDetails.findAllWhereColIn(trxNewDb, "refSpId", vendorIds, ["gName", "refSpId", "gEntityId"]);
  });
  return vendors;
};

export const srGetAllVendorOrSupplierUserFromNewDb = async (vendorUserIds: string[]): Promise<MdEntityUser[]> => {
  let vendorsUser: MdEntityUser[] = [];
  await newDbConnection.transaction(async (trxNewDb) => {
    vendorsUser = await doEntityUser.findAllWhereColIn(trxNewDb, "refId", vendorUserIds, ["refId", "euEntityId"]);
  });
  return vendorsUser;
};

export const srGetPreferencesOfVendorOrSupplierUserFromNewDb = async (refId: string): Promise<MdUserPreferences[]> => {
  let userPreference: MdUserPreferences[] = [];
  await newDbConnection.transaction(async (trxNewDb) => {
    const entityUser = await doEntityUser.findOneByCol(trxNewDb, "refId", refId);
    userPreference = await doUserPreferences
      .findAllWhereColIn(trxNewDb, "upUserEntityId", [entityUser.euUserEntityId], ["upType", "upValue"]);
  });
  return userPreference;
};

export const srAddDummyDataToOldDb = async (data: tpDummyDataForOldDb): Promise<unknown[]> => {
  const {
    dtDummyOldDbVendor,
    dtDummyOldDbVendorUser,
    dtDummyOldDbSupplier,
    dtDummyOldDbSupplierUser,
    dtDummyOldDbCompanyRel,
    dtDummyOldDbCompanySettings,
  } = data;
  let dummyIds: unknown[] = [];
  await oldDbConnection.transaction(async (trxOldDb) => {
    await trxOldDb<tpTblOldDbCompanyRel>(tblNameOldDbCompanyRel).where("com_sp_id" as string,
      dtDummyOldDbSupplier.sp_id).delete();
    await trxOldDb<tpTblOldDbCompanySettings>(tblNameOldDbCompanySettings).where("cs_sp_id" as string,
      dtDummyOldDbSupplier.sp_id).delete();
    const vendors = await trxOldDb<tpTblOldDbVendor>(tblNameOldDbVendor)
      .insert(dtDummyOldDbVendor).onConflict(["vd_id"]).merge()
      .returning("*");
    const vendorsUser = await trxOldDb<tpTblOldDbVendorUser>(tblNameOldDbVendorUser)
      .insert(dtDummyOldDbVendorUser).onConflict(["vusr_id"]).merge()
      .returning("*");
    const suppliers = await trxOldDb<tpTblOldDbSupplier>(tblNameOldDbSupplier)
      .insert(dtDummyOldDbSupplier).onConflict(["sp_id"]).merge()
      .returning("*");
    const supplierUser = await trxOldDb<tpTblOldDbSupplierUser>(tblNameOldDbSupplierUser)
      .insert(dtDummyOldDbSupplierUser).onConflict(["susr_id"]).merge()
      .returning("*");
    const companyRel = await trxOldDb<tpTblOldDbCompanyRel>(tblNameOldDbCompanyRel)
      .insert(dtDummyOldDbCompanyRel).returning("*");
    const companySettings = await trxOldDb<tpTblOldDbCompanySettings>(tblNameOldDbCompanySettings)
      .insert(dtDummyOldDbCompanySettings).returning("*");
    dummyIds = [vendors, vendorsUser, suppliers, supplierUser, companyRel, companySettings].flat();
  });
  return dummyIds;
};
