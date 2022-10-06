import MdBase from "../../../base/models/mdBase";
import { EntityTypes } from "../../shared/types/tpShared";

class MdCreatorEntity extends MdBase {
  static TABLE_NAME = "creator_entity";

  constructor(
    public ceCreatorId: string,
    public ceEntityId: string,
    public ceEntityType: EntityTypes,
    public ceCreatedAt?: string,
    public ceId?: string,
  ) {
    super();
  }

  static col(k: keyof MdCreatorEntity, prefix = true): string {
    return prefix ? `${MdCreatorEntity.TABLE_NAME}.${k}` : k;
  }
}

export default MdCreatorEntity;
