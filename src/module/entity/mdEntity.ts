import MdBase from "../../base/models/mdBase";
import { EntityStatusTypesType, EntityTypes } from "../shared/types/tpShared";

class MdEntity extends MdBase {
  static TABLE_NAME = "entity";

  constructor(
    public entityType: EntityTypes,
    public entityStatus?: EntityStatusTypesType,
    public entityCreatedAt?: string,
    public entityId?: string,
  ) {
    super();
  }

  static col(k: keyof MdEntity, prefix = true): string {
    return prefix ? `${MdEntity.TABLE_NAME}.${k}` : k;
  }
}

export default MdEntity;
