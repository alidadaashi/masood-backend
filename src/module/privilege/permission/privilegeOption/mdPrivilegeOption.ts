import { PermissionOptionTypes } from "../../../shared/types/tpShared";

class MdPrivilegeOption {
  static TABLE_NAME = "privilege_option";

  constructor(
    public poOptionType: PermissionOptionTypes,
    public poOption: string,
    public poPrivilegeId: string,
    public poCreatedAt?: string,
    public poId?: string,
  ) {
  }

  static col(k: keyof MdPrivilegeOption, prefix = true): string {
    return prefix ? `${MdPrivilegeOption.TABLE_NAME}.${k}` : k;
  }
}

export default MdPrivilegeOption;
