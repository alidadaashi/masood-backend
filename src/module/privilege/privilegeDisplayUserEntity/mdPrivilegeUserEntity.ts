import MdBase from "../../../base/models/mdBase";
import { EntityTypes } from "../../shared/types/tpShared";

class MdPrivilegeUserEntity extends MdBase {
  static TABLE_NAME = "privilege_user_entity";

  constructor(
    public pueUserEntityId: string,
    public pueEntityId: string,
    public pueEntityType: EntityTypes,
    public pueCreatedAt?: string,
    public pueId?: string,
  ) {
    super();
  }

  static col(k: keyof MdPrivilegeUserEntity, prefix = true): string {
    return prefix ? `${MdPrivilegeUserEntity.TABLE_NAME}.${k}` : k;
  }
}

export default MdPrivilegeUserEntity;
