import srMigrateDataFromOldToNewDb from "./dataMigration/services/srMigration";
import { srGetNewDbConnection, srGetOldDbConnection } from "./dataMigration/srConnection";
import srRunDbSyncJob from "./dataMigration/services/srMigrateSync";
import srSetupDb from "./dataMigration/services/srSetupDb";

const oldDbConnection = srGetOldDbConnection();
const newDbConnection = srGetNewDbConnection();

srSetupDb(oldDbConnection).then(() => {
  srMigrateDataFromOldToNewDb(oldDbConnection, newDbConnection)
    .then(({ vendorsDomain, suppDomain }) => {
      if (vendorsDomain && suppDomain) srRunDbSyncJob(oldDbConnection, newDbConnection, vendorsDomain, suppDomain);
    });
});
