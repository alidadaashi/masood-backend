import { Transaction } from "knex";
import DoUserSelectedInstance from "./doUserSelectedInstance";
import MdUserSelectedInstance from "./mdUserSelectedInstance";
import SrUser from "../srUser";
import DoGroupDetails from "../../entities/group/doGroupDetails";
import MdGroupDetails from "../../entities/group/mdGroupDetails";

class SrUserSelectedInstance {
  static async getSelectedInstance(trx: Transaction, sessionUserId: string):Promise<MdUserSelectedInstance|undefined> {
    return DoUserSelectedInstance.findOneByCol(trx, "usiUserEntityId", sessionUserId);
  }

  static async getUserSelectedInstance(trx: Transaction, userEntityId: string): Promise<MdGroupDetails> {
    let userSelectedInstance = await DoUserSelectedInstance.findOneByCol(trx, "usiUserEntityId", userEntityId);
    if (!userSelectedInstance) {
      const userInstances = await SrUser.getUserInstances(trx, userEntityId, false);
      const [firstInstance] = userInstances;
      if (firstInstance) {
        const [insertedSelectedInstance] = await DoUserSelectedInstance.insertOne(trx, {
          usiUserEntityId: userEntityId,
          usiSelectedInstanceEntityId: firstInstance.gEntityId,
        });
        userSelectedInstance = insertedSelectedInstance;
      }
    }
    return DoGroupDetails.findOneByCol(trx, "gEntityId", userSelectedInstance.usiSelectedInstanceEntityId);
  }
}

export default SrUserSelectedInstance;
