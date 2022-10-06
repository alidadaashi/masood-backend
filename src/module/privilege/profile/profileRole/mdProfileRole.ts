import MdBase from "../../../../base/models/mdBase";
import { EntityStatusTypesType } from "../../../shared/types/tpShared";

class MdProfileRole extends MdBase {
  static TABLE_NAME = "profile_role";

  constructor(
    public prProfileId: string,
    public prRoleId: string,
    public prStatus?: EntityStatusTypesType,
    public prCreatedAt?: string,
    public prId?: string,
  ) {
    super();
  }

  static col(k: keyof MdProfileRole, prefix = true): string {
    return prefix ? `${MdProfileRole.TABLE_NAME}.${k}` : k;
  }
}

export default MdProfileRole;
