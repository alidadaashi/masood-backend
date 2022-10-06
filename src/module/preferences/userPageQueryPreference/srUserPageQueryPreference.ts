import { Transaction } from "knex";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import MdUserPageQueryPreference from "./mdUserPageQueryPreference";
import DoUserPageQueryPreference from "./doUserPageQueryPreference";
import DoUserPagePreference from "../userPagePreference/doUserPagePreference";
import SrUserPagePreference from "../userPagePreference/srUserPagePreference";
import { ERR_DELETING_NOT_EXISTS, ERR_PREFERENCE_NAME_ALREADY_EXISTS } from "../../shared/constants/dtOtherConstants";

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

class SrUserPageQueryPreference {
  static async addQueryPreference(
    trx: Transaction,
    userEntityId: string,
    pageKey: string,
    preference: MdUserPageQueryPreference,
  ):Promise<Pick<MdUserPageQueryPreference, "upqpId"|"upqpName">> {
    const { uppId } = await srGetParentPagePreference(trx, userEntityId, pageKey);
    if (!await DoUserPageQueryPreference.isPreferenceQueryPreferenceExists(trx, uppId, preference.upqpName)) {
      const [data] = await DoUserPageQueryPreference.insertOne(trx, {
        upqpPagePreferenceId: uppId,
        upqpName: preference.upqpName,
        upqpPreference: preference.upqpPreference,
      }, ["upqpId", "upqpName"]);
      return data;
    }
    throw new MdUnprocessableEntityError(ERR_PREFERENCE_NAME_ALREADY_EXISTS);
  }

  static async updateQueryPreference(
    trx: Transaction,
    userEntityId: string,
    preferenceId: string,
    preference: MdUserPageQueryPreference,
  ):Promise<void> {
    const existingParentPreference = await DoUserPageQueryPreference.findOneByCol(trx, "upqpId", preferenceId);
    if (existingParentPreference) {
      if (!await DoUserPageQueryPreference.isPreferenceQueryPreferenceExists(
        trx, existingParentPreference.upqpPagePreferenceId as string, preference.upqpName, existingParentPreference.upqpId,
      )) {
        await DoUserPageQueryPreference.updateOneByColName(trx, {
          upqpName: preference.upqpName,
          upqpPreference: preference.upqpPreference,
        }, "upqpId", preferenceId);
      } else {
        throw new MdUnprocessableEntityError(ERR_PREFERENCE_NAME_ALREADY_EXISTS);
      }
    }
  }

  static async getQueryPreferences(
    trx: Transaction,
    userEntityId: string,
    pageKey: string,
  ):Promise<Pick<MdUserPageQueryPreference, "upqpId"|"upqpName">[]> {
    const parentPagePreference = await srGetExistingPreference(trx, userEntityId, pageKey);
    if (parentPagePreference) {
      return DoUserPageQueryPreference
        .findAllByCol(trx, "upqpPagePreferenceId", parentPagePreference.uppId, ["upqpId", "upqpName"]);
    }
    return [];
  }

  static async getQueryPreferenceDetails(
    trx: Transaction,
    preferenceId: string,
  ):Promise<MdUserPageQueryPreference|null> {
    const preference = await DoUserPageQueryPreference
      .findOneByCol(trx, "upqpId", preferenceId, ["upqpPagePreferenceId", "upqpPreference"]);
    if (preference) return preference;
    return null;
  }

  static async deleteQueryPreference(
    trx: Transaction,
    preferenceId: string,
  ):Promise<void> {
    const preference = await DoUserPageQueryPreference
      .findOneByCol(trx, "upqpId", preferenceId, ["upqpPagePreferenceId"]);
    if (preference) {
      await DoUserPageQueryPreference.deleteOneByCol(trx, "upqpId", preferenceId);
      await SrUserPagePreference.updateChildFavoritePreferenceStateToNull(
        trx, preference.upqpPagePreferenceId as string, preference.upqpId as string, "uppFavoriteQueryId",
      );
    } else {
      throw new MdUnprocessableEntityError(ERR_DELETING_NOT_EXISTS);
    }
  }

  static async getFavoritePageQueryPreferenceDetails(
    trx: Transaction,
    userEntityId: string,
    pageKey: string,
  ):Promise<MdUserPageQueryPreference|null> {
    const favoritePreference = await SrUserPagePreference.getPagePreferenceByPageKey(trx, userEntityId, pageKey);
    if (favoritePreference && favoritePreference.uppFavoriteQueryId) {
      return DoUserPageQueryPreference
        .findOneByCol(trx, "upqpId", favoritePreference.uppFavoriteQueryId, ["upqpPreference"]);
    }
    return null;
  }
}

export default SrUserPageQueryPreference;
