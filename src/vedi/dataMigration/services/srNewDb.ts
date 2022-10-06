import { Transaction } from "knex";
import MdGroupDetails from "../../../module/entities/group/mdGroupDetails";
import MdEntityUser from "../../../module/entity/entityUser/mdEntityUser";
import DoGroupDetails from "../../../module/entities/group/doGroupDetails";
import MdDomainDetails from "../../../module/entities/domain/mdDomainDetails";
import DoEntityUser from "../../../module/entity/entityUser/doEntityUser";
import {
  tpOldDbSupplierPrivileges,
  tpOldDbSuserPrivs,
  tpOldDbVendorPrivileges,
  tpOldDbVendorSettings,
  tpOldDbVuserPrivs,
  tpTblOldDbSupplier, tpTblOldDbSupplierUser, tpTblOldDbVendor, tpTblOldDbVendorUser,
} from "../tpOldDb";
import { utUpdateMigrationUser } from "../utils/utMigration";
import {
  srGetOldDbVendorSettings, srInsertSupplierUserToNewDb, srInsertVendorUserToNewDb, tpMigrationData,
} from "./srMigration";
import MdCredential from "../../../module/user/credentials/mdCredential";
import MdUser from "../../../module/user/mdUser";
import { UserPreferencesType } from "../../../module/shared/types/tpShared";
import {
  doGetOldDbSupplierPrivilegesBySuserId, doGetOldDbVendorBySupplierUser, doGetOldDbVendorPrivilegesByVuserId,
  doGetOldDbVendorSettings,
} from "../dao/doMigration";
import {
  oldDbNumberFormatPrefName, oldDbPercentageScalePrefName, oldDbPriceScalePrefName, oldDbQuantityScalePrefName,
} from "../data/dtMigration";
import { stdLog } from "../../../module/shared/utils/utLog";
import { utUpdateOldSupplierPrivilegesIsSyncStatus, utUpdateOldVendorPrivilegesIsSyncStatus } from "../utils/utOldDbSync";

export const srIsSupplierExistsInNewDb = async (
  trxNewDb: Transaction,
  supplier: tpTblOldDbSupplier,
  domain: MdDomainDetails,
): Promise<MdGroupDetails> => DoGroupDetails.findOneByPredicate(trxNewDb, {
  refSpId: supplier.sp_id,
  gDomainEntityId: domain.dEntityId,
});

export const srIsVendorExistsInNewDb = async (
  trxNewDb: Transaction,
  vendor: tpTblOldDbVendor,
  domain: MdDomainDetails,
): Promise<MdGroupDetails> => DoGroupDetails.findOneByPredicate(trxNewDb, {
  refSpId: vendor.vd_id,
  gDomainEntityId: domain.dEntityId,
});

export const srGetVendorGroupInNewDbByRefId = async (
  trxNewDb: Transaction,
  refId: string,
  domain: MdDomainDetails,
): Promise<MdGroupDetails> => DoGroupDetails.findOneByPredicate(trxNewDb, {
  refSpId: refId,
  gDomainEntityId: domain.dEntityId,
});

export const srIsVendorUserExistsInNewDb = async (
  trxNewDb: Transaction,
  vuser: tpTblOldDbVendorUser,
  vendor: MdGroupDetails,
): Promise<MdEntityUser> => DoEntityUser.findOneByPredicate(trxNewDb, {
  refId: vuser.vusr_id,
  euEntityId: vendor.gEntityId,
});

export const srIsSupplierUserExistsInNewDb = async (
  trxNewDb: Transaction,
  suser: tpTblOldDbSupplierUser,
  supplier: MdGroupDetails,
): Promise<MdEntityUser> => DoEntityUser.findOneByPredicate(trxNewDb, {
  refId: suser.susr_id,
  euEntityId: supplier.gEntityId,
});

export const srUpdateSupplierInNewDb = async (
  trxNewDb: Transaction,
  supplierNewDetails: tpTblOldDbSupplier,
  existingSupplier: MdGroupDetails,
): Promise<void> => {
  await DoGroupDetails.updateOneByColName(
    trxNewDb, { gName: supplierNewDetails.sp_name }, "gId", existingSupplier.gId as string,
  );
};

export const srUpdateVendorInNewDb = async (
  trxNewDb: Transaction,
  vendorNewDetails: tpTblOldDbVendor,
  existingVendor: MdGroupDetails,
): Promise<void> => {
  await DoGroupDetails.updateOneByColName(
    trxNewDb, { gName: vendorNewDetails.vd_name }, "gId", existingVendor.gId as string,
  );
};

export const srUpdateVendorUserInNewDb = async (
  trxNewDb: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  { vuserNewDetails, vuserPrivs }: { vuserNewDetails: tpTblOldDbVendorUser, vuserPrivs: tpOldDbVuserPrivs },
  existingUser: MdEntityUser,
): Promise<MdUser & MdCredential> => utUpdateMigrationUser(trxNewDb, { domain, group, vendorSettings }, existingUser, {
  userEmail: vuserNewDetails.vusr_email,
  userName: vuserNewDetails.vusr_name,
  password: vuserNewDetails.vusr_password,
  userId: vuserNewDetails.vusr_id,
  parentId: vuserNewDetails.vusr_vd_id,
  timeZone: vuserNewDetails.vusr_timezone,
  linesPerPage: vuserNewDetails.vusr_lines_per_page,
  language: vuserNewDetails.vusr_language,
  dateFormat: vuserNewDetails.vusr_dateformat,
  vuserPrivilege: vuserNewDetails.vusr_privileges,
  vendorPrivileges: vuserPrivs,
});

export const srUpdateSupplierUserInNewDb = async (
  trxNewDb: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  { suserNewDetails, suserPrivs }: { suserNewDetails: tpTblOldDbSupplierUser, suserPrivs: tpOldDbSuserPrivs },
  existingSuppUser: MdEntityUser,
): Promise<MdUser & MdCredential> => utUpdateMigrationUser(trxNewDb, { domain, group, vendorSettings }, existingSuppUser, {
  userEmail: suserNewDetails.susr_email,
  userName: suserNewDetails.susr_name,
  password: suserNewDetails.susr_password,
  userId: suserNewDetails.susr_id,
  parentId: suserNewDetails.susr_sp_id,
  timeZone: suserNewDetails.susr_timezone,
  linesPerPage: suserNewDetails.susr_lines_per_page,
  language: suserNewDetails.susr_language,
  dateFormat: suserNewDetails.susr_dateformat,
  suserPrivilege: suserNewDetails.susr_privileges,
  supplierPrivileges: suserPrivs,
});

export const srInsertOrUpdateVendorUserInNewDb = async (
  trxNewDb: Transaction,
  { domain, group, vendorSettings }: tpMigrationData,
  vuserNewDetails: tpTblOldDbVendorUser,
  vuserPrivs: tpOldDbVuserPrivs,
): Promise<void> => {
  if (group) {
    const existingUser = await srIsVendorUserExistsInNewDb(trxNewDb, vuserNewDetails as tpTblOldDbVendorUser, group);
    if (existingUser) {
      await srUpdateVendorUserInNewDb(
        trxNewDb, { domain, group, vendorSettings }, { vuserNewDetails, vuserPrivs }, existingUser,
      );
    } else {
      await srInsertVendorUserToNewDb(trxNewDb, {
        domain, group, vendorSettings,
      }, vuserNewDetails as tpTblOldDbVendorUser, vuserPrivs);
    }
  } else {
    stdLog(`The parent vendor group-${vuserNewDetails.vusr_id} does not exists in new db`);
  }
};

export const srInsertOrUpdateSupplierUserInNewDb = async (
  trxNewDb: Transaction,
  { domain, vendorSettings }: { domain: MdDomainDetails, vendorSettings: tpOldDbVendorSettings },
  suser: tpTblOldDbSupplierUser,
  userPrivsInOldDb: tpOldDbSuserPrivs,
): Promise<void> => {
  const vendorGroup = await srGetVendorGroupInNewDbByRefId(trxNewDb, suser.susr_sp_id, domain);
  if (vendorGroup) {
    const existingUser = await srIsSupplierUserExistsInNewDb(trxNewDb, suser as tpTblOldDbSupplierUser, vendorGroup);
    if (existingUser) {
      await srUpdateSupplierUserInNewDb(
        trxNewDb, { domain, group: vendorGroup, vendorSettings }, {
          suserNewDetails: suser, suserPrivs: userPrivsInOldDb,
        }, existingUser,
      );
    } else {
      await srInsertSupplierUserToNewDb(trxNewDb, {
        domain, group: vendorGroup, vendorSettings,
      }, suser as tpTblOldDbSupplierUser, userPrivsInOldDb);
    }
  } else {
    stdLog(`The parent supplier group-${suser.susr_sp_id} does not exist in new db`);
  }
};

export const srMapOldDbVendorSettingsToUserPref = async (
  oldDbTrx: Transaction,
  vendorId: string,
): Promise<UserPreferencesType> => {
  const numberFormatPref = await doGetOldDbVendorSettings(oldDbTrx, vendorId, oldDbNumberFormatPrefName);
  const quantityScalePref = await doGetOldDbVendorSettings(oldDbTrx, vendorId, oldDbQuantityScalePrefName);
  const priceScalePref = await doGetOldDbVendorSettings(oldDbTrx, vendorId, oldDbPriceScalePrefName);
  const percentageScalePref = await doGetOldDbVendorSettings(oldDbTrx, vendorId, oldDbPercentageScalePrefName);
  return {
    uPrcDecRng: priceScalePref?.cs_value,
    numFmt: numberFormatPref?.cs_value,
    qtyDecRng: quantityScalePref?.cs_value,
    pctDecRng: percentageScalePref?.cs_value,
  } as UserPreferencesType;
};

export const srUpdateVendorUserPrivilegesInNewDb = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  domain: MdDomainDetails,
  { oldDbUser, vuserPriv }: { oldDbUser: tpTblOldDbVendorUser, vuserPriv: tpOldDbVendorPrivileges },
): Promise<void> => {
  const group = await srGetVendorGroupInNewDbByRefId(trxNewDb, oldDbUser.vusr_vd_id, domain);
  const existingUser = await srIsVendorUserExistsInNewDb(trxNewDb, oldDbUser as tpTblOldDbVendorUser, group);
  const vendorSettings = await srGetOldDbVendorSettings(trxOldDb, oldDbUser.vusr_vd_id);
  const updatedUserPrivs = await doGetOldDbVendorPrivilegesByVuserId(trxOldDb, vuserPriv.vpriv_vusr_id);
  if (existingUser) {
    await srUpdateVendorUserInNewDb(
      trxNewDb, { domain, group, vendorSettings }, {
        vuserNewDetails: oldDbUser, vuserPrivs: updatedUserPrivs,
      }, existingUser,
    );
    await utUpdateOldVendorPrivilegesIsSyncStatus(trxOldDb, oldDbUser.vusr_id);
  } else {
    stdLog("No user exists in new db with id", vuserPriv.vpriv_vusr_id);
  }
};

export const srUpdateSuppUserPrivilegesInNewDb = async (
  trxOldDb: Transaction,
  trxNewDb: Transaction,
  domain: MdDomainDetails,
  { oldDbSuser, suserPriv }: { oldDbSuser: tpTblOldDbSupplierUser, suserPriv: tpOldDbSupplierPrivileges },
): Promise<void> => {
  const group = await srGetVendorGroupInNewDbByRefId(trxNewDb, oldDbSuser.susr_sp_id, domain);
  const existingUser = await srIsSupplierUserExistsInNewDb(trxNewDb, oldDbSuser as tpTblOldDbSupplierUser, group);
  const getVendorIdBySuser = await doGetOldDbVendorBySupplierUser(trxOldDb, oldDbSuser.susr_id);
  const updatedUserPrivs = await doGetOldDbSupplierPrivilegesBySuserId(trxOldDb, suserPriv.spriv_susr_id);
  const vendorSettings = await srGetOldDbVendorSettings(trxOldDb, getVendorIdBySuser?.suvr_vd_id as string);
  if (existingUser) {
    await srUpdateSupplierUserInNewDb(
      trxNewDb, { domain, group, vendorSettings }, { suserNewDetails: oldDbSuser, suserPrivs: updatedUserPrivs },
      existingUser,
    );
    await utUpdateOldSupplierPrivilegesIsSyncStatus(trxOldDb, oldDbSuser.susr_id);
  } else {
    stdLog("No suser exists in new db with id", suserPriv.spriv_susr_id);
  }
};
