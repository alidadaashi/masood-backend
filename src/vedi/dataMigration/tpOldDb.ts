export type tpTblOldDbVendor = {
  vd_id: string,
  vd_name: string,
  ref_updated_date: string,
  ref_is_synced: boolean,
}

export type tpTblOldDbVendorUser = {
  vusr_id: string,
  vusr_vd_id: string,
  vusr_name: string,
  vusr_password: string,
  vusr_email: string,
  vusr_dateformat: string,
  vusr_timezone: string,
  vusr_lines_per_page: number,
  vusr_language: string,
  vusr_privileges?: number,
  ref_updated_date: string,
  ref_is_synced: boolean,
}

export type tpTblOldDbSupplier = {
  sp_id: string,
  sp_name: string,
  sp_creation_date: string,
  ref_updated_date?: string,
  com_vd_id?: string,
  ref_is_synced: boolean,
};

export type tpTblOldDbSupplierUser = {
  susr_id: string,
  susr_sp_id: string,
  susr_name: string,
  susr_password: string,
  susr_email: string,
  susr_dateformat: string,
  susr_timezone: string,
  susr_lines_per_page: number,
  susr_language: string,
  susr_privileges?: number,
  ref_updated_date: string,
  ref_is_synced: boolean,
}

export type tpTblOldDbCompanyRel = {
  com_vd_id: string,
  com_sp_id: string,
}

export type tpDummyDataForOldDb = {
  dtDummyOldDbVendor: tpTblOldDbVendor;
  dtDummyOldDbVendorUser: tpTblOldDbVendorUser;
  dtDummyOldDbSupplier: tpTblOldDbSupplier;
  dtDummyOldDbSupplierUser: tpTblOldDbSupplierUser;
  dtDummyOldDbCompanyRel: tpTblOldDbCompanyRel;
  dtDummyOldDbCompanySettings: tpTblOldDbCompanySettings
}

export type tpTblOldDbCompanySettings = {
  cs_vd_id: string,
  cs_sp_id: string,
  cs_refer_name: string,
  cs_value: string,
  ref_updated_date: string,
  ref_is_synced: boolean,
}

export type tpOldDbVendorSettings = {
  numberFormat?: string,
  priceScale?: string,
  quantityScale?: string,
  percentageScale?: string
}

export type tpOldDbVendorPrivileges = {
  vpriv_privilege: string,
  vpriv_vusr_id: string,
  ref_updated_date: string,
  ref_is_synced: boolean,
}

export type tpOldDbSupplierPrivileges = {
  spriv_privilege: string,
  spriv_susr_id: string,
  ref_updated_date: string,
  ref_is_synced: boolean,
}

export type tpOldDbVendorSuserRel = {
  suvr_vd_id: string,
  suvr_id: string,
  suvr_sp_id: string,
  suvr_susr_id: string
}

export type tpOldDbSuserPrivs = Pick<tpOldDbSupplierPrivileges, "spriv_privilege">[]
export type tpOldDbVuserPrivs = Pick<tpOldDbVendorPrivileges, "vpriv_privilege">[]

export type tpUserMigrationData = {
  userEmail: string,
  userName: string,
  password: string,
  userId: string,
  parentId: string,
  timeZone: string,
  language: string,
  linesPerPage: number,
  dateFormat: string,
  vuserPrivilege?: number,
  suserPrivilege?: number,
  vendorPrivileges?: tpOldDbVuserPrivs, supplierPrivileges?: tpOldDbSuserPrivs
}
