class MdPrivilege {
  static TABLE_NAME = "privilege";

  constructor(
    public pPrivilege: string,
    public pModuleId: string,
    public pCreatedAt?: string,
    public pId?: string,
  ) {
  }

  static col(k: keyof MdPrivilege, prefix = true): string {
    return prefix ? `${MdPrivilege.TABLE_NAME}.${k}` : k;
  }
}

export default MdPrivilege;
