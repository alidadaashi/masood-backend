import DoBase from "../../../base/dao/doBase";
import MdCreatorEntity from "./mdCreatorEntity";

class DoCreatorEntity extends DoBase<MdCreatorEntity> {
  constructor() {
    super(MdCreatorEntity.TABLE_NAME);
  }
}

export default new DoCreatorEntity();
