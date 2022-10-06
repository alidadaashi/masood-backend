class MdDbSyncDetails {
  static TABLE_NAME = "db_sync_details";

  constructor(
    public lastSyncAt: string,
  ) {
  }

  static col(k: keyof MdDbSyncDetails, prefix = true): string {
    return prefix ? `${MdDbSyncDetails.TABLE_NAME}.${k}` : k;
  }
}

export default MdDbSyncDetails;
