import { Transaction } from "knex";
import mdModule from "./mdModule";
import doModule from "./doModule";

const utAddOrGetModule = async (trx: Transaction, module: mdModule): Promise<mdModule> => {
  const mdFoundModule = await doModule.findOneByPredicate(trx, {
    mModuleName: module.mModuleName,
    mModuleType: module.mModuleType,
  });
  if (mdFoundModule) return mdFoundModule;
  const [mdInsertedModule] = await doModule.insertOne(trx, module);
  return mdInsertedModule;
};

export default utAddOrGetModule;
