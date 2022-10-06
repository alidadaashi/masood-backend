import DoBase from "../../../base/dao/doBase";
import MdCampSuppInstanceFieldRec from "./mdCampSuppInstanceFieldRec";

class DoCampSuppInstanceFieldRec extends DoBase<MdCampSuppInstanceFieldRec> {
  constructor() {
    super(MdCampSuppInstanceFieldRec.TABLE_NAME);
  }
}

export default new DoCampSuppInstanceFieldRec();
