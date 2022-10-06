import { Transaction } from "knex";
import MdUserPagePreference from "./mdUserPagePreference";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import DoUserPagePreference from "./doUserPagePreference";
import { ERR_PREFERENCE_NOT_EXISTS } from "../../shared/constants/dtOtherConstants";

class SrUserPagePreference {
  static async addPagePreference(
    trx: Transaction, data: Pick<MdUserPagePreference, "uppKey"|"uppEntityId">,
  ):Promise<MdUserPagePreference> {
    const [pagePreferenceModel] = await DoUserPagePreference.insertOne(trx, data);
    return pagePreferenceModel;
  }

  static getPagePreferenceByPageKey(
    trx: Transaction, entityId: string, pageKey: string,
  ):Promise<MdUserPagePreference|undefined> {
    return DoUserPagePreference.findOneByPredicate(trx, {
      uppEntityId: entityId,
      uppKey: pageKey,
    });
  }

  static getPagePreference(trx: Transaction, id: string):Promise<MdUserPagePreference|undefined> {
    return DoUserPagePreference.findOneByCol(trx, "uppId", id);
  }

  static async updatePagePreference(
    trx: Transaction, id: string, data: MdUserPagePreference,
  ):Promise<MdUserPagePreference> {
    const [pagePreferenceModel] = await DoUserPagePreference.updateOneByColName(trx, data, "uppId", id);
    return pagePreferenceModel;
  }

  static async deletePagePreference(trx: Transaction, id: string):Promise<void> {
    const existingPreference = await SrUserPagePreference.getPagePreference(trx, id);
    if (existingPreference) {
      await DoUserPagePreference.deleteOneByCol(trx, "uppId", id);
    } else {
      throw new MdUnprocessableEntityError(ERR_PREFERENCE_NOT_EXISTS);
    }
  }

  static async updateChildFavoritePreferenceStateToNull(
    trx: Transaction,
    id: string,
    deletedChildPrefId: string,
    colName: keyof Pick<MdUserPagePreference, "uppFavoriteLayoutId"|"uppFavoriteQueryId">,
  ):Promise<void> {
    const existingPreference = await SrUserPagePreference.getPagePreference(trx, id);
    if (existingPreference && existingPreference[colName] === deletedChildPrefId) {
      await DoUserPagePreference.updateOneByColName(trx, {
        [colName]: null,
      }, "uppId", id);
    }
  }
}

export default SrUserPagePreference;
