import Knex, { Transaction } from "knex";
import {
  defaultVendorSettings, oldDbNumberFormatPrefName, oldDbPercentageScalePrefName, oldDbPriceScalePrefName,
  oldDbQuantityScalePrefName,
} from "../data/dtMigration";
import MdDomainDetails from "../../../module/entities/domain/mdDomainDetails";
import DoDomainDetails from "../../../module/entities/domain/doDomainDetails";
import {
  doGetOldDbAllVendors, doGetOldDbSupplierPrivilegesBySuserId, doGetOldDbSupplierUsers,
  doGetOldDbVendorPrivilegesByVuserId, doGetOldDbVendorSettings, doGetOldDbVendorSuppliers, doGetOldDbVendorUsers,
} from "../dao/doMigration";
import {
  tpOldDbSuserPrivs, tpOldDbVendorSettings, tpOldDbVuserPrivs,
  tpTblOldDbSupplier, tpTblOldDbSupplierUser, tpTblOldDbVendor, tpTblOldDbVendorUser,
} from "../tpOldDb";
import { utAddDummyDomain, utAddMigrationGroup, utAddMigrationUser } from "../utils/utMigration";
import DoVendorSupplier from "../../module/vendorSupplier/DoVendorSupplier";
import MdGroupDetails from "../../../module/entities/group/mdGroupDetails";
import { stdLog } from "../../../module/shared/utils/utLog";
import DoGroupDetails from "../../../module/entities/group/doGroupDetails";
import {
  utUpdateOldCompanySettingsIsSyncStatus, utUpdateOldSupplierIsSyncStatus,
  utUpdateOldSupplierPrivilegesIsSyncStatus, utUpdateOldSupplierUsersIsSyncStatus,
  utUpdateOldVendorPrivilegesIsSyncStatus, utUpdateOldVendorsIsSyncStatus,
  utUpdateOldVendorUsersIsSyncStatus,
} from "../utils/utOldDbSync";

export type tpMigrationData = {
  domain: MdDomainDetails,
  vendorSettings: tpOldDbVendorSettings,
  group: MdGroupDetails,
}

const srGetDummyDomain = async (
  trx: Transaction,
): Promise<MdDomainDetails> => DoDomainDetails.findOneByCol(trx, "dName", "Domain");

export const srInsertVendorToNewDb = async (
  newDbTrx: Transaction, domain: MdDomainDetails, vendor: tpTblOldDbVendor,
): Promise<MdGroupDetails> => utAddMigrationGroup(newDbTrx, domain, {
  groupName: vendor.vd_name,
  entityType: "group",
  refId: vendor.vd_id,
  creationDate: null,
  originalType: "vendor",
});

const srInsertVendorSupplierToNewDb = async (
  newDbTrx: Transaction,
  supplier: Omit<tpTblOldDbSupplier, "ref_is_synced" | "ref_updated_date">,
  domain: MdDomainDetails,
  vendorGroup: MdGroupDetails,
): Promise<MdGroupDetails> => {
  const creationDate = supplier.sp_creation_date === "0000-00-00 00:00:00" ? null : supplier.sp_creation_date;
  const groupDetails = await utAddMigrationGroup(newDbTrx, domain, {
    groupName: supplier.sp_name,
    entityType: "business-partner",
    refId: supplier.sp_id,
    creationDate,
    originalType: "supplier",
  });
  const groupEntityIdSupplier = groupDetails.gEntityId;
  await DoVendorSupplier.insertOne(newDbTrx, {
    vsVendorId: vendorGroup.gEntityId,
    vsSupplierId: groupEntityIdSupplier,
  });
  return groupDetails;
};

export const srInsertVendorUserToNewDb = async (
  newDbTrx: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  user: tpTblOldDbVendorUser,
  userPrivsInOldDb: tpOldDbVuserPrivs,
): Promise<void> => utAddMigrationUser(newDbTrx, { domain, group, vendorSettings }, {
  userEmail: user.vusr_email,
  userName: user.vusr_name,
  password: user.vusr_password,
  userId: user.vusr_id,
  parentId: user.vusr_vd_id,
  timeZone: user.vusr_timezone,
  linesPerPage: user.vusr_lines_per_page,
  language: user.vusr_language,
  dateFormat: user.vusr_dateformat,
  vuserPrivilege: user.vusr_privileges,
  vendorPrivileges: userPrivsInOldDb,
});

export const srInsertSupplierUserToNewDb = async (
  newDbTrx: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  supplier: tpTblOldDbSupplierUser,
  userPrivsInOldDb: tpOldDbSuserPrivs,
): Promise<void> => utAddMigrationUser(newDbTrx, { domain, group, vendorSettings }, {
  userEmail: supplier.susr_email,
  userName: supplier.susr_name,
  password: supplier.susr_password,
  userId: supplier.susr_id,
  parentId: supplier.susr_sp_id,
  timeZone: supplier.susr_timezone,
  linesPerPage: supplier.susr_lines_per_page,
  language: supplier.susr_language,
  dateFormat: supplier.susr_dateformat,
  suserPrivilege: supplier.susr_privileges,
  supplierPrivileges: userPrivsInOldDb,
});

const srInsertVendorUsersToNewDb = async (
  oldDbTrx: Transaction,
  newDbTrx: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  vendorUsers: tpTblOldDbVendorUser[],
): Promise<void> => {
  for (let i = 0; i < vendorUsers.length; i += 1) {
    const user = vendorUsers[i];
    const userPrivsInOldDb = await doGetOldDbVendorPrivilegesByVuserId(oldDbTrx, user.vusr_id);
    await srInsertVendorUserToNewDb(newDbTrx, { domain, group, vendorSettings }, user, userPrivsInOldDb);
    await utUpdateOldVendorPrivilegesIsSyncStatus(oldDbTrx, user.vusr_id);
  }
};

const srInsertSupplierUsersToNewDb = async (
  oldDbTrx: Transaction,
  newDbTrx: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  supplierUsers: tpTblOldDbSupplierUser[],
): Promise<void> => {
  for (let i = 0; i < supplierUsers.length; i += 1) {
    const user = supplierUsers[i];
    const userPrivsInOldDb = await doGetOldDbSupplierPrivilegesBySuserId(oldDbTrx, user.susr_id);
    await srInsertSupplierUserToNewDb(newDbTrx, { domain, group, vendorSettings }, user, userPrivsInOldDb);
    await utUpdateOldSupplierPrivilegesIsSyncStatus(oldDbTrx, user.susr_id);
  }
};

export const srGetOldDbVendorSettings = async (
  oldDbTrx: Transaction,
  vendorId: string,
): Promise<tpOldDbVendorSettings> => {
  if (vendorId) {
    const numberFormatPref = await doGetOldDbVendorSettings(oldDbTrx, vendorId, oldDbNumberFormatPrefName);
    const quantityScalePref = await doGetOldDbVendorSettings(oldDbTrx, vendorId, oldDbQuantityScalePrefName);
    const priceScalePref = await doGetOldDbVendorSettings(oldDbTrx, vendorId, oldDbPriceScalePrefName);
    const percentageScalePref = await doGetOldDbVendorSettings(oldDbTrx, vendorId, oldDbPercentageScalePrefName);
    return {
      priceScale: priceScalePref?.cs_value,
      numberFormat: numberFormatPref?.cs_value,
      quantityScale: quantityScalePref?.cs_value,
      percentageScale: percentageScalePref?.cs_value,
    };
  }
  return defaultVendorSettings as tpOldDbVendorSettings;
};

const srMigrateSupplierUsers = async (
  oldDbTrx: Transaction,
  newDbTrx: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  supplierId: string,
): Promise<void> => {
  const supplierUsers = await doGetOldDbSupplierUsers(oldDbTrx, supplierId);
  if (supplierUsers?.length) {
    await srInsertSupplierUsersToNewDb(oldDbTrx, newDbTrx, { domain, group, vendorSettings }, supplierUsers);
    await utUpdateOldSupplierUsersIsSyncStatus(oldDbTrx, supplierUsers as tpTblOldDbSupplierUser[]);
    stdLog(` - - Migrated ${supplierUsers.length} users for supplier-${supplierId}`);
  } else {
    stdLog(` - - [x] There are no supplier users for ${supplierId}`);
  }
};

export const srMigrateSupplierAndSuppUsersToNewDb = async (
  oldDbTrx: Transaction,
  newDbTrx: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  supplier: Omit<tpTblOldDbSupplier, "ref_is_synced" | "ref_updated_date">,
): Promise<void> => {
  const isSupplierAlreadyExists = await DoGroupDetails.findOneByPredicate(newDbTrx, {
    refSpId: supplier.sp_id,
    gDomainEntityId: domain.dEntityId,
  });
  if (!isSupplierAlreadyExists) {
    const supplierGroup = await srInsertVendorSupplierToNewDb(newDbTrx, supplier, domain, group);
    await srMigrateSupplierUsers(oldDbTrx, newDbTrx, { domain, vendorSettings, group: supplierGroup }, supplier.sp_id);
  } else {
    await DoVendorSupplier.insertOne(newDbTrx, {
      vsVendorId: group.gEntityId,
      vsSupplierId: isSupplierAlreadyExists.gEntityId,
    });
  }
};

export const srMigrateVendorSuppliers = async (
  oldDbTrx: Transaction,
  newDbTrx: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  vendorId: string,
): Promise<void> => {
  const vendorSuppliers = await doGetOldDbVendorSuppliers(oldDbTrx, vendorId);
  if (vendorSuppliers?.length) {
    for (let i = 0; i < vendorSuppliers.length; i += 1) {
      const supplier = vendorSuppliers[i];
      await srMigrateSupplierAndSuppUsersToNewDb(oldDbTrx, newDbTrx, { domain, group, vendorSettings }, supplier);
    }
    await utUpdateOldSupplierIsSyncStatus(oldDbTrx, vendorSuppliers as tpTblOldDbSupplier[]);
    stdLog(` - Migrated ${vendorSuppliers.length} suppliers for vendor-${vendorId}`);
  } else {
    stdLog(` - [x] There are no vendor suppliers for ${vendorId}`);
  }
};

export const srMigrateVendorUsers = async (
  oldDbTrx: Transaction,
  newDbTrx: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  vendorId: string,
): Promise<void> => {
  const vendorUsers = await doGetOldDbVendorUsers(oldDbTrx, vendorId);
  if (vendorUsers?.length) {
    await srInsertVendorUsersToNewDb(oldDbTrx, newDbTrx, { domain, group, vendorSettings }, vendorUsers);
    await utUpdateOldVendorUsersIsSyncStatus(oldDbTrx, vendorUsers as tpTblOldDbVendorUser[]);
    stdLog(` - Migrated ${vendorUsers.length} users for vendor-${vendorId}`);
  } else {
    stdLog(` - [x] There are no vendor users for ${vendorId}`);
  }
};

export const srMigrateVendorWithUsersAndSuppliers = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  vendor: tpTblOldDbVendor,
  { vendorsDomain, suppDomain }: { vendorsDomain: MdDomainDetails, suppDomain: MdDomainDetails },
): Promise<void> => {
  const vendorGroup = await srInsertVendorToNewDb(trxNewDb, vendorsDomain, vendor);
  stdLog(`The vendor-${vendor.vd_id} has been migrated _/`);
  const vendorSettings = await srGetOldDbVendorSettings(trxOldDb, vendor.vd_id);
  await srMigrateVendorUsers(trxOldDb, trxNewDb, {
    domain: vendorsDomain, group: vendorGroup, vendorSettings,
  }, vendor.vd_id);
  await srMigrateVendorSuppliers(trxOldDb, trxNewDb, {
    domain: suppDomain, group: vendorGroup, vendorSettings,
  }, vendor.vd_id);
  await utUpdateOldCompanySettingsIsSyncStatus(trxOldDb, vendor.vd_id);
};

const srMigrateDataFromOldToNewDb = async (
  oldDbConnection: Knex,
  newDbConnection: Knex,
): Promise<{ vendorsDomain: MdDomainDetails | null, suppDomain: MdDomainDetails | null }> => {
  let vendorsDomain: MdDomainDetails | null = null;
  let suppDomain: MdDomainDetails | null = null;
  await oldDbConnection.transaction(async (trxOldDb) => {
    await newDbConnection.transaction(async (trxNewDb) => {
      vendorsDomain = await srGetDummyDomain(trxNewDb);
      suppDomain = await utAddDummyDomain(trxNewDb);
      stdLog("The dummy domains have been created _/");
      const vendors = await doGetOldDbAllVendors(trxOldDb);
      for (let i = 0; i < vendors.length; i += 1) {
        const vendor = vendors[i];
        await srMigrateVendorWithUsersAndSuppliers(trxOldDb, trxNewDb, vendor, { vendorsDomain, suppDomain });
      }
      await utUpdateOldVendorsIsSyncStatus(trxOldDb, vendors as tpTblOldDbVendor[]);
      stdLog(`All ${vendors.length} vendors have been migrated _/`);
    });
  });
  return { vendorsDomain, suppDomain };
};

export default srMigrateDataFromOldToNewDb;
