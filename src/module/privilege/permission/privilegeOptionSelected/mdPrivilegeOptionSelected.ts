class MdPrivilegeOptionSelected {
  static TABLE_NAME = "privilege_option_selected";

  constructor(
    public posPrivilegeOptionId: string,
    public posRolePrivilegeId: string,
    public posCreatedAt?: string,
    public posId?: string,
  ) {
  }

  static col(k: keyof MdPrivilegeOptionSelected, prefix = true): string {
    return prefix ? `${MdPrivilegeOptionSelected.TABLE_NAME}.${k}` : k;
  }
}

export default MdPrivilegeOptionSelected;
