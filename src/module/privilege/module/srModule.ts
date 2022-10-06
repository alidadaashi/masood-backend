import { Transaction } from "knex";
import DoModule from "./doModule";
import MdModule from "./mdModule";

class SrModule {
  static getAllModules(trx: Transaction): Promise<MdModule[]> {
    return DoModule.getAll(trx, ["mModuleId", "mModuleName"]);
  }

  static getAllModulesHierarchy(trx: Transaction): Promise<MdModule[]> {
    return DoModule.getModuleHierarchy(trx, ["mModuleId", "mModuleName", "path", "depth"]);
  }
}

export default SrModule;
