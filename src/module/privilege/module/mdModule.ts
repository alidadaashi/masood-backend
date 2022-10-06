import MdBase from "../../../base/models/mdBase";
import { EntityStatusTypesType } from "../../shared/types/tpShared";

class MdModule extends MdBase {
  static TABLE_NAME = "module";

  constructor(
    public mModuleType: string,
    public mModuleName: string,
    public mModuleParentId?: string | null,
    public mModuleStatus?: EntityStatusTypesType,
    public mModuleCreatedAt?: string,
    public mModuleId?: string,
  ) {
    super();
  }

  static col(k: keyof MdModule, prefix = true): string {
    return prefix ? `${MdModule.TABLE_NAME}.${k}` : k;
  }
}

export default MdModule;
