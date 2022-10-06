import { Transaction } from "knex";
import UserPageLayoutPreferenceModel from "./mdUserPageLayoutPreference";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import DoUserPagePreference from "../userPagePreference/doUserPagePreference";
import SrUserPagePreference from "../userPagePreference/srUserPagePreference";
import DoUserPageLayoutPreference from "./doUserPageLayoutPreference";
import { ERR_DELETING_NOT_EXISTS, ERR_PREFERENCE_DETAILS_NOT_EXISTS, ERR_PREFERENCE_NAME_ALREADY_EXISTS } from "../../shared/constants/dtOtherConstants";

const srGetExistingPreference = (
  trx: Transaction, entityId: string, pageKey: string,
) => DoUserPagePreference.findOneByPredicate(trx, {
  uppKey: pageKey,
  uppEntityId: entityId,
});

const srGetParentPagePreference = async (
  trx: Transaction,
  userEntityId: string,
  pageKey: string,
) => {
  let existingPagePreference = await srGetExistingPreference(trx, userEntityId, pageKey);
  if (!existingPagePreference) {
    existingPagePreference = await SrUserPagePreference.addPagePreference(trx, {
      uppEntityId: userEntityId,
      uppKey: pageKey,
    });
  }

  return existingPagePreference;
};

class SrUserPageLayoutPreference {
  static async addLayoutPreference(
    trx: Transaction,
    userEntityId: string,
    pageKey: string,
    preference: UserPageLayoutPreferenceModel,
  ):Promise<Pick<UserPageLayoutPreferenceModel, "uplpId"|"uplpName">> {
    const { uppId } = await srGetParentPagePreference(trx, userEntityId, pageKey);
    if (!await DoUserPageLayoutPreference.isPreferenceLayoutNameExists(trx, uppId, preference.uplpName)) {
      const [data] = await DoUserPageLayoutPreference.insertOne(trx, {
        uplpPagePreferenceId: uppId,
        uplpName: preference.uplpName,
        uplpPreference: preference.uplpPreference,
      }, ["uplpId", "uplpName"]);
      return data;
    }
    throw new MdUnprocessableEntityError(ERR_PREFERENCE_NAME_ALREADY_EXISTS);
  }

  static async updateLayoutPreference(
    trx: Transaction,
    preferenceId: string,
    preference: UserPageLayoutPreferenceModel,
  ):Promise<void> {
    const existingParentPreference = await DoUserPageLayoutPreference.findOneByCol(trx, "uplpId", preferenceId);
    if (existingParentPreference) {
      if (!await DoUserPageLayoutPreference.isPreferenceLayoutNameExists(
        trx, existingParentPreference.uplpPagePreferenceId, preference.uplpName, existingParentPreference.uplpId,
      )) {
        await DoUserPageLayoutPreference.updateOneByColName(trx, {
          uplpName: preference.uplpName,
          uplpPreference: preference.uplpPreference,
        }, "uplpId", preferenceId);
      } else {
        throw new MdUnprocessableEntityError(ERR_PREFERENCE_NAME_ALREADY_EXISTS);
      }
    }
  }

  static async getLayoutPreferences(
    trx: Transaction,
    userEntityId: string,
    pageKey: string,
  ):Promise<Pick<UserPageLayoutPreferenceModel, "uplpId"|"uplpName">[]> {
    const parentPagePreference = await srGetExistingPreference(trx, userEntityId, pageKey);
    if (parentPagePreference) {
      return DoUserPageLayoutPreference
        .findAllByCol(trx, "uplpPagePreferenceId", parentPagePreference.uppId, ["uplpId", "uplpName"]);
    }
    return [];
  }

  static async getLayoutPreferenceDetails(
    trx: Transaction,
    preferenceId: string,
  ):Promise<Pick<UserPageLayoutPreferenceModel, "uplpPreference">> {
    const preference = await DoUserPageLayoutPreference
      .findOneByCol(trx, "uplpId", preferenceId, ["uplpPreference"]);
    if (preference) return preference;
    throw new MdUnprocessableEntityError(ERR_PREFERENCE_DETAILS_NOT_EXISTS);
  }

  static async deleteLayoutPreference(
    trx: Transaction,
    preferenceId: string,
  ):Promise<void> {
    const preference = await DoUserPageLayoutPreference
      .findOneByCol(trx, "uplpId", preferenceId, ["uplpPagePreferenceId"]);
    if (preference) {
      await DoUserPageLayoutPreference.deleteOneByCol(trx, "uplpId", preferenceId);
      await SrUserPagePreference.updateChildFavoritePreferenceStateToNull(
        trx, preference.uplpPagePreferenceId, preference.uplpId, "uppFavoriteLayoutId",
      );
    } else {
      throw new MdUnprocessableEntityError(ERR_DELETING_NOT_EXISTS);
    }
  }

  static async getFavoritePageLayoutPreferenceDetails(
    trx: Transaction,
    userEntityId: string,
    pageKey: string,
  ):Promise<UserPageLayoutPreferenceModel|null> {
    const favoritePreference = await SrUserPagePreference.getPagePreferenceByPageKey(trx, userEntityId, pageKey);
    if (favoritePreference && favoritePreference.uppFavoriteLayoutId) {
      return DoUserPageLayoutPreference
        .findOneByCol(trx, "uplpId", favoritePreference.uppFavoriteLayoutId, ["uplpPreference"]);
    }
    return null;
  }
}

export default SrUserPageLayoutPreference;
