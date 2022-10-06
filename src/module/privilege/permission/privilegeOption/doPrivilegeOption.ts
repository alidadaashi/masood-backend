import MdPrivilegeOption from "./mdPrivilegeOption";
import DoBase from "../../../../base/dao/doBase";

class DoPrivilegeOption extends DoBase<MdPrivilegeOption> {
  constructor() {
    super(MdPrivilegeOption.TABLE_NAME);
  }
}

export default new DoPrivilegeOption();
