import DoBase from "../../../base/dao/doBase";
import MdStickyNoteTousersEntity from "./mdStickyNoteTousersEntity";

class DoStickyNoteTousersEntity extends DoBase<MdStickyNoteTousersEntity> {
  constructor() {
    super(MdStickyNoteTousersEntity.TABLE_NAME);
  }
}

export default new DoStickyNoteTousersEntity();
