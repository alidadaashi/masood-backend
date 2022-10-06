import MdBase from "../../../../base/models/mdBase";

class MdRolePrivilege extends MdBase {
  static TABLE_NAME = "role_privilege";

  constructor(
    public rpRoleId: string,
    public rpPrivilegeId: string,
    public rpCreatedAt?: string,
    public rpId?: string,
  ) {
    super();
  }

  static col(k: keyof MdRolePrivilege, prefix = true): string {
    return prefix ? `${MdRolePrivilege.TABLE_NAME}.${k}` : k;
  }
}

export default MdRolePrivilege;
