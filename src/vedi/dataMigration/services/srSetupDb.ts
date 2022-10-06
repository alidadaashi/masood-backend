import Knex, { Transaction } from "knex";
import {
  tblNameOldDbCompanySettings, tblNameOldDbSupplier, tblNameOldDbSupplierPrivileges, tblNameOldDbSupplierUser,
  tblNameOldDbVendor, tblNameOldDbVendorPrivileges, tblNameOldDbVendorUser,
} from "../data/dtMigration";
import { stdLog } from "../../../module/shared/utils/utLog";

const updateAtColName = "ref_updated_date";
const refSpUpdateAtColName = "ref_sp_updated_date";
const isSyncedColName = "ref_is_synced";
const triggerIsSyncedColBeforeVendorUpdate = "before_vendor_update";
const triggerIsSyncedColBeforeVuserUpdate = "before_vuser_update";
const triggerIsSyncedColBeforeSupplierUpdate = "before_supplier_update";
const triggerIsSyncedColBeforeSuserUpdate = "before_suser_update";
const triggerIsSyncedColBeforeComSettingsUpdate = "before_comp_settings_update";
const triggerIsSyncedColBeforeVendorPrivsUpdate = "before_vendor_priviliges_update";
const triggerIsSyncedColBeforeSuppPrivsUpdate = "before_supp_privileges_update";

const srDropColumnFromOldDbTable = async (oldDbTrx: Transaction, tblName: string, colName: string) => {
  await oldDbTrx.schema.hasColumn(tblName, colName).then(() => {
    oldDbTrx.schema.table(tblName, (t) => t.dropColumn(colName));
  });
};

const srDropExistingSetupInOldDb = async (oldDbTrx: Transaction, tblName: string) => {
  await oldDbTrx.raw(`
    DROP TRIGGER IF EXISTS ${triggerIsSyncedColBeforeVendorUpdate};
  `);
  await oldDbTrx.raw(`
  DROP TRIGGER IF EXISTS ${triggerIsSyncedColBeforeVuserUpdate};
  `);
  await oldDbTrx.raw(`
  DROP TRIGGER IF EXISTS ${triggerIsSyncedColBeforeSuserUpdate};
  `);
  await oldDbTrx.raw(`
  DROP TRIGGER IF EXISTS ${triggerIsSyncedColBeforeSupplierUpdate};
  `);
  await oldDbTrx.raw(`
  DROP TRIGGER IF EXISTS ${triggerIsSyncedColBeforeComSettingsUpdate};
  `);
  await oldDbTrx.raw(`
  DROP TRIGGER IF EXISTS ${triggerIsSyncedColBeforeVendorPrivsUpdate};
  `);
  await oldDbTrx.raw(`
  DROP TRIGGER IF EXISTS ${triggerIsSyncedColBeforeSuppPrivsUpdate};
  `);
  await srDropColumnFromOldDbTable(oldDbTrx, tblName, refSpUpdateAtColName);
  await srDropColumnFromOldDbTable(oldDbTrx, tblName, updateAtColName);
  await srDropColumnFromOldDbTable(oldDbTrx, tblName, isSyncedColName);
};

const srAddColumnsToOldDbTbl = async (oldDbTrx: Transaction, tblName: string) => {
  const isColumnExists = await oldDbTrx.schema.hasColumn(tblName, isSyncedColName);
  if (!isColumnExists) {
    const alterSchema = oldDbTrx.schema
      .alterTable(tblName, (table) => {
        table.timestamp(updateAtColName).defaultTo(oldDbTrx.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
        table.boolean(isSyncedColName).defaultTo(false);
      });
    await alterSchema;
  }
};

export const srAddUpdateTriggerToSyncCol = (
  oldDbTrx: Transaction, tblName: string, triggerName: string,
): Promise<void> => oldDbTrx.raw(`
      CREATE TRIGGER ${triggerName}
      BEFORE UPDATE 
        ON ${tblName} FOR EACH ROW
      BEGIN
        IF OLD.${isSyncedColName} = TRUE THEN
          SET NEW.${isSyncedColName} = false;
        END IF;
      END
`);

export const srAddUpdateTriggersToDbTables = async (
  oldDbConnection: Knex,
): Promise<void> => {
  await oldDbConnection.transaction(async (oldDbTrx) => {
    await srAddUpdateTriggerToSyncCol(oldDbTrx, tblNameOldDbVendor, triggerIsSyncedColBeforeVendorUpdate);
    await srAddUpdateTriggerToSyncCol(oldDbTrx, tblNameOldDbVendorUser, triggerIsSyncedColBeforeVuserUpdate);
    await srAddUpdateTriggerToSyncCol(oldDbTrx, tblNameOldDbSupplier, triggerIsSyncedColBeforeSupplierUpdate);
    await srAddUpdateTriggerToSyncCol(oldDbTrx, tblNameOldDbSupplierUser, triggerIsSyncedColBeforeSuserUpdate);
    await srAddUpdateTriggerToSyncCol(oldDbTrx, tblNameOldDbCompanySettings, triggerIsSyncedColBeforeComSettingsUpdate);
    await srAddUpdateTriggerToSyncCol(oldDbTrx, tblNameOldDbVendorPrivileges, triggerIsSyncedColBeforeVendorPrivsUpdate);
    await srAddUpdateTriggerToSyncCol(oldDbTrx, tblNameOldDbSupplierPrivileges, triggerIsSyncedColBeforeSuppPrivsUpdate);
    stdLog("The update triggers have been created");
  });
};

const srDropExistingSetupInOldDbTables = async (
  oldDbTrx: Transaction,
): Promise<void> => {
  await srDropExistingSetupInOldDb(oldDbTrx, tblNameOldDbVendor);
  await srDropExistingSetupInOldDb(oldDbTrx, tblNameOldDbVendorUser);
  await srDropExistingSetupInOldDb(oldDbTrx, tblNameOldDbSupplier);
  await srDropExistingSetupInOldDb(oldDbTrx, tblNameOldDbSupplierUser);
  await srDropExistingSetupInOldDb(oldDbTrx, tblNameOldDbCompanySettings);
  await srDropExistingSetupInOldDb(oldDbTrx, tblNameOldDbVendorPrivileges);
  await srDropExistingSetupInOldDb(oldDbTrx, tblNameOldDbSupplierPrivileges);
  stdLog("Dropping the existing columns (If exists already)");
};

const srAddColumnsToOldDbTables = async (
  oldDbTrx: Transaction,
): Promise<void> => {
  await srAddColumnsToOldDbTbl(oldDbTrx, tblNameOldDbVendor);
  await srAddColumnsToOldDbTbl(oldDbTrx, tblNameOldDbVendorUser);
  await srAddColumnsToOldDbTbl(oldDbTrx, tblNameOldDbSupplier);
  await srAddColumnsToOldDbTbl(oldDbTrx, tblNameOldDbSupplierUser);
  await srAddColumnsToOldDbTbl(oldDbTrx, tblNameOldDbCompanySettings);
  await srAddColumnsToOldDbTbl(oldDbTrx, tblNameOldDbVendorPrivileges);
  await srAddColumnsToOldDbTbl(oldDbTrx, tblNameOldDbSupplierPrivileges);
  stdLog("The additional columns have been created");
};

const srSetupDb = async (oldDbConnection: Knex): Promise<void> => {
  await oldDbConnection.transaction(async (oldDbTrx) => {
    await srDropExistingSetupInOldDbTables(oldDbTrx);
    await srAddColumnsToOldDbTables(oldDbTrx);
  });
};

export default srSetupDb;
