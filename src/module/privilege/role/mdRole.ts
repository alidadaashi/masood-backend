import MdBase from "../../../base/models/mdBase";
import { EntityStatusTypesType } from "../../shared/types/tpShared";

class MdRole extends MdBase {
  static TABLE_NAME = "role";

  constructor(
    public rRoleName: string,
    public rRoleStatus?: EntityStatusTypesType,
    public rRoleCreatedAt?: string,
    public rRoleId?: string,
  ) {
    super();
  }

  static col(k: keyof MdRole, prefix = true): string {
    return prefix ? `${MdRole.TABLE_NAME}.${k}` : k;
  }
}

export default MdRole;
