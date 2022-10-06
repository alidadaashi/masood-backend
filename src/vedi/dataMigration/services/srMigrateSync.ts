import Knex, { Transaction } from "knex";
import cron from "node-cron";
import { stdLog } from "../../../module/shared/utils/utLog";
import {
  tpTblOldDbCompanyRel, tpTblOldDbCompanySettings,
  tpTblOldDbSupplier, tpTblOldDbSupplierUser, tpTblOldDbVendor, tpTblOldDbVendorUser,
} from "../tpOldDb";
import {
  doGetOldDbSupplierPrivilegesBySuserId, doGetOldDbSupplierUserByUserId, doGetOldDbSupplierUsersByVendorId,
  doGetOldDbUnSyncedSupplierPrivileges, doGetOldDbUnSyncedSupplierUsers, doGetOldDbUnSyncedVendorPrivileges,
  doGetOldDbUnSyncedVendors, doGetOldDbUnSyncedVendorSettings, doGetOldDbUnSyncedVendorSuppliers,
  doGetOldDbUnSyncedVendorUsers, doGetOldDbVendorBySupplierUser, doGetOldDbVendorPrivilegesByVuserId,
  doGetOldDbVendorUserByUserId, doGetOldDbVendorUsers,
} from "../dao/doMigration";
import MdDomainDetails from "../../../module/entities/domain/mdDomainDetails";
import {
  srGetOldDbVendorSettings, srMigrateSupplierAndSuppUsersToNewDb, srMigrateVendorWithUsersAndSuppliers, tpMigrationData,
} from "./srMigration";
import DoDbSyncDetails from "../../module/dbSyncDetails/doDbSyncDetails";
import DoEntityUser from "../../../module/entity/entityUser/doEntityUser";
import {
  srAddUpdateTriggersToDbTables,
} from "./srSetupDb";
import SrUserPreferences from "../../../module/preferences/userPreference/srUserPreferences";
import { UserPreferencesType } from "../../../module/shared/types/tpShared";
import {
  srGetVendorGroupInNewDbByRefId, srInsertOrUpdateSupplierUserInNewDb, srInsertOrUpdateVendorUserInNewDb,
  srIsSupplierExistsInNewDb, srIsVendorExistsInNewDb, srMapOldDbVendorSettingsToUserPref, srUpdateSupplierInNewDb,
  srUpdateSuppUserPrivilegesInNewDb, srUpdateVendorInNewDb, srUpdateVendorUserPrivilegesInNewDb,
} from "./srNewDb";
import {
  utUpdateOldCompanySettingsIsSyncStatus, utUpdateOldSupplierIsSyncStatus,
  utUpdateOldSupplierUsersIsSyncStatus, utUpdateOldVendorsIsSyncStatus,
  utUpdateOldVendorUsersIsSyncStatus,
} from "../utils/utOldDbSync";
import { AppEnv } from "../../../base/loaders/cfgBaseLoader";

const srInsertOrUpdateVendorInNewDb = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  { vendorsDomain, suppDomain }: { vendorsDomain: MdDomainDetails, suppDomain: MdDomainDetails },
  vendor: tpTblOldDbVendor,
): Promise<void> => {
  const existingVendor = await srIsVendorExistsInNewDb(trxNewDb, vendor as tpTblOldDbVendor, vendorsDomain);
  if (existingVendor) {
    await srUpdateVendorInNewDb(trxNewDb, vendor as tpTblOldDbVendor, existingVendor);
  } else {
    stdLog(">> Migrating users and suppliers of vendor", vendor.vd_id);
    await srMigrateVendorWithUsersAndSuppliers(trxOldDb, trxNewDb, vendor, { vendorsDomain, suppDomain });
  }
};

const srInsertOrUpdateSupplierInNewDb = async (
  trxNewDb: Transaction,
  trxOldDb: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  supplier: Pick<tpTblOldDbCompanyRel & tpTblOldDbSupplier, "sp_id" | "sp_name" | "sp_creation_date" | "com_vd_id">,
): Promise<void> => {
  if (group) {
    const existingSupplier = await srIsSupplierExistsInNewDb(trxNewDb, supplier as tpTblOldDbSupplier, domain);
    if (existingSupplier) {
      await srUpdateSupplierInNewDb(trxNewDb, supplier as tpTblOldDbSupplier, existingSupplier);
    } else {
      stdLog(">> Migrating supplier and supplier users of supplier", supplier.sp_id);
      await srMigrateSupplierAndSuppUsersToNewDb(trxOldDb, trxNewDb, { domain, group, vendorSettings }, supplier);
    }
  } else {
    stdLog(`The parent vendor group-${supplier.sp_id} does not exists in new db`);
  }
};

const srSyncVendors = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  vendorsDomain: MdDomainDetails,
  suppDomain: MdDomainDetails,
): Promise<void> => {
  const unSyncedVendors = await doGetOldDbUnSyncedVendors(trxOldDb);
  if (!unSyncedVendors.length) {
    stdLog("<> There are no un-synced vendors <>");
  } else {
    for (let i = 0; i < unSyncedVendors.length; i += 1) {
      const vendor = unSyncedVendors[i];
      stdLog(">> Sync vendor of id", vendor.vd_id);
      await srInsertOrUpdateVendorInNewDb(trxOldDb, trxNewDb, { vendorsDomain, suppDomain }, vendor);
    }
    await utUpdateOldVendorsIsSyncStatus(trxOldDb, unSyncedVendors as tpTblOldDbVendor[]);
  }
};

const srSyncVendorUsers = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  domain: MdDomainDetails,
): Promise<void> => {
  const unSyncedVendorUsers = await doGetOldDbUnSyncedVendorUsers(trxOldDb);
  if (!unSyncedVendorUsers.length) {
    stdLog("<> There are no un-synced users <>");
  } else {
    for (let i = 0; i < unSyncedVendorUsers.length; i += 1) {
      stdLog(">> Sync user of id", unSyncedVendorUsers[i].vusr_id);
      const vendorGroup = await srGetVendorGroupInNewDbByRefId(trxNewDb, unSyncedVendorUsers[i].vusr_vd_id, domain);
      const vendorSettings = await srGetOldDbVendorSettings(trxOldDb, unSyncedVendorUsers[i].vusr_vd_id);
      const userPrivsInOldDb = await doGetOldDbVendorPrivilegesByVuserId(trxOldDb, unSyncedVendorUsers[i].vusr_id);
      await srInsertOrUpdateVendorUserInNewDb(trxNewDb, {
        domain, group: vendorGroup, vendorSettings,
      }, unSyncedVendorUsers[i], userPrivsInOldDb);
    }
    await utUpdateOldVendorUsersIsSyncStatus(trxOldDb, unSyncedVendorUsers as tpTblOldDbVendorUser[]);
  }
};

const srSyncVendorSuppliers = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  domain: MdDomainDetails,
): Promise<void> => {
  const unSyncedSuppliers = await doGetOldDbUnSyncedVendorSuppliers(trxOldDb);
  if (!unSyncedSuppliers.length) {
    stdLog("<> There are no un-synced suppliers <>");
  } else {
    for (let i = 0; i < unSyncedSuppliers.length; i += 1) {
      const supplier = unSyncedSuppliers[i];
      stdLog(">> Sync supplier of id", supplier.sp_id);
      const vendorGroup = await srGetVendorGroupInNewDbByRefId(trxNewDb, supplier.sp_id, domain);
      const vendorSettings = await srGetOldDbVendorSettings(trxOldDb, supplier.com_vd_id);
      await srInsertOrUpdateSupplierInNewDb(trxNewDb, trxOldDb, {
        domain, group: vendorGroup, vendorSettings,
      }, supplier);
    }
    await utUpdateOldSupplierIsSyncStatus(trxOldDb, unSyncedSuppliers as tpTblOldDbSupplier[]);
  }
};

const srSyncSupplierUsers = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  domain: MdDomainDetails,
): Promise<void> => {
  const unSyncedSupplierUsers = await doGetOldDbUnSyncedSupplierUsers(trxOldDb);
  if (!unSyncedSupplierUsers.length) {
    stdLog("<> There are no un-synced supplier users <>");
  } else {
    for (let i = 0; i < unSyncedSupplierUsers.length; i += 1) {
      stdLog(">> Sync supplier user of id", unSyncedSupplierUsers[i].susr_id);
      const getVendorIdBySuser = await doGetOldDbVendorBySupplierUser(trxOldDb, unSyncedSupplierUsers[i].susr_id);
      const vendorSettings = await srGetOldDbVendorSettings(trxOldDb, getVendorIdBySuser?.suvr_vd_id as string);
      const userPrivsInOldDb = await doGetOldDbSupplierPrivilegesBySuserId(trxOldDb, unSyncedSupplierUsers[i].susr_id);
      await srInsertOrUpdateSupplierUserInNewDb(trxNewDb, {
        domain, vendorSettings,
      }, unSyncedSupplierUsers[i], userPrivsInOldDb);
    }
    await utUpdateOldSupplierUsersIsSyncStatus(trxOldDb, unSyncedSupplierUsers as tpTblOldDbSupplierUser[]);
  }
};

const srSyncSettingsForVendorUsers = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  vendorPref: tpTblOldDbCompanySettings,
  updatedPreference: UserPreferencesType,
): Promise<void> => {
  const vendorUsersInOldDb = await doGetOldDbVendorUsers(trxOldDb, vendorPref.cs_vd_id);
  const updateVuserSettings = vendorUsersInOldDb.map(async (vuser) => {
    const entityUser = await DoEntityUser.findOneByCol(trxNewDb, "refId", vuser.vusr_id);
    await SrUserPreferences.updateUserPreferences(trxNewDb, entityUser.euEntityId, { payload: updatedPreference });
  });
  await Promise.all(updateVuserSettings);
};

const srSyncSettingsForSupplierUsers = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  vendorPref: tpTblOldDbCompanySettings,
  updatedPreference: UserPreferencesType,
): Promise<void> => {
  const supplierUsersInOldDb = await doGetOldDbSupplierUsersByVendorId(trxOldDb, vendorPref.cs_vd_id);
  const updateSuserSettings = supplierUsersInOldDb.map(async (suser) => {
    const entityUser = await DoEntityUser.findOneByCol(trxNewDb, "refId", suser.suvr_susr_id);
    await SrUserPreferences.updateUserPreferences(trxNewDb, entityUser.euEntityId, { payload: updatedPreference });
  });
  await Promise.all(updateSuserSettings);
};

const srSyncVendorSettings = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
): Promise<void> => {
  const unSyncedVendorSettings = await doGetOldDbUnSyncedVendorSettings(trxOldDb);
  if (!unSyncedVendorSettings.length) {
    stdLog("<> There are no un-synced vendor settings <>");
  } else {
    for (let i = 0; i < unSyncedVendorSettings.length; i += 1) {
      const vendorPref = unSyncedVendorSettings[i];
      stdLog(">> Sync settings of vendor", vendorPref.cs_vd_id);
      const updatedPreference = await srMapOldDbVendorSettingsToUserPref(trxOldDb, vendorPref.cs_vd_id);
      await srSyncSettingsForVendorUsers(trxOldDb, trxNewDb, vendorPref, updatedPreference);
      await srSyncSettingsForSupplierUsers(trxOldDb, trxNewDb, vendorPref, updatedPreference);
      await utUpdateOldCompanySettingsIsSyncStatus(trxOldDb, vendorPref.cs_vd_id);
    }
  }
};

const srSyncVendorPrivileges = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  domain: MdDomainDetails,
): Promise<void> => {
  const unSyncedVendorPrivileges = await doGetOldDbUnSyncedVendorPrivileges(trxOldDb);
  if (!unSyncedVendorPrivileges.length) {
    stdLog("<> There are no un-synced vendor privileges <>");
  } else {
    for (let i = 0; i < unSyncedVendorPrivileges.length; i += 1) {
      const vuserPriv = unSyncedVendorPrivileges[i];
      const oldDbUser = await doGetOldDbVendorUserByUserId(trxOldDb, vuserPriv.vpriv_vusr_id);
      if (oldDbUser) {
        stdLog(">> Sync privileges of vendor user", vuserPriv.vpriv_vusr_id);
        await srUpdateVendorUserPrivilegesInNewDb(trxOldDb, trxNewDb, domain, { oldDbUser, vuserPriv });
      }
    }
  }
};

const srSyncSupplierPrivileges = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  domain: MdDomainDetails,
): Promise<void> => {
  const unSyncedSupplierPrivs = await doGetOldDbUnSyncedSupplierPrivileges(trxOldDb);
  if (!unSyncedSupplierPrivs.length) {
    stdLog("<> There are no un-synced supplier privileges <>");
  } else {
    for (let i = 0; i < unSyncedSupplierPrivs.length; i += 1) {
      const suserPriv = unSyncedSupplierPrivs[i];
      const oldDbSuser = await doGetOldDbSupplierUserByUserId(trxOldDb, suserPriv.spriv_susr_id);
      if (oldDbSuser) {
        stdLog(">> Sync privileges of supplier user", suserPriv.spriv_susr_id);
        await srUpdateSuppUserPrivilegesInNewDb(trxOldDb, trxNewDb, domain, { oldDbSuser, suserPriv });
      }
    }
  }
};

const srSyncDatabases = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  vendorsDomain: MdDomainDetails,
  suppDomain: MdDomainDetails,
): Promise<void> => {
  await srSyncVendors(trxOldDb, trxNewDb, vendorsDomain, suppDomain);
  await srSyncVendorUsers(trxOldDb, trxNewDb, vendorsDomain);
  await srSyncVendorSuppliers(trxOldDb, trxNewDb, suppDomain);
  await srSyncSupplierUsers(trxOldDb, trxNewDb, suppDomain);
  await srSyncVendorSettings(trxOldDb, trxNewDb);
  await srSyncVendorPrivileges(trxOldDb, trxNewDb, vendorsDomain);
  await srSyncSupplierPrivileges(trxOldDb, trxNewDb, suppDomain);
  await DoDbSyncDetails.insertOne(trxNewDb, {});
};

let ifPreviousInProcess = false;
const srRunDbSyncJob = async (
  oldDbConnection: Knex,
  newDbConnection: Knex,
  vendorsDomain: MdDomainDetails,
  suppDomain: MdDomainDetails,
): Promise<void> => {
  stdLog("\n\r___Starting db sync process___\n\r");
  await srAddUpdateTriggersToDbTables(oldDbConnection);
  const scheduleMinutes = `*/${AppEnv.oldDbSyncIntervalInMinutes} * * * *`;
  cron.schedule(scheduleMinutes, async () => {
    try {
      if (!ifPreviousInProcess) {
        await oldDbConnection.transaction(async (trxOldDb) => {
          await newDbConnection.transaction(async (trxNewDb) => {
            stdLog("Sync databases in process...");
            ifPreviousInProcess = true;
            await srSyncDatabases(trxOldDb, trxNewDb, vendorsDomain, suppDomain);
            ifPreviousInProcess = false;
            stdLog("Sync databases is complete_/\n\r");
          });
        });
      }
    } catch (err) {
      stdLog(err as string);
    }
  });
};

export default srRunDbSyncJob;
