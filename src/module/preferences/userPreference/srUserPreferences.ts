import { Transaction } from "knex";
import {
  UserPreferencesKeyType,
  UserPreferencesType,
  UserPreferencesPayload,
} from "../../shared/types/tpShared";
import doUserPreferences from "./doUserPreferences";
import MdUserPreferences from "./mdUserPreferences";
import { defaultUserPreferences } from "../../shared/data/dtUserPreferences";

class SrUserPreferences {
  static async updateUserPreferences(
    trx: Transaction,
    userEntityId: string,
    data: UserPreferencesPayload,
  ): Promise<void> {
    const { payload } = data;
    const preferenceUpdate = Object.keys(payload).map(async (key:string) => {
      const value = payload[key];
      const existingUserPreferenceType = await doUserPreferences.findOneByPredicate(trx, {
        upUserEntityId: userEntityId,
        upType: key,
      });
      if (existingUserPreferenceType) {
        await doUserPreferences.updateOneByPredicate(
          trx,
          {
            upValue: value,
          },
          {
            upUserEntityId: userEntityId,
            upType: key,
          },
        );
      } else {
        await doUserPreferences.insertOne(trx, {
          upUserEntityId: userEntityId,
          upValue: value,
          upType: key,
        });
      }
    });
    await Promise.all(preferenceUpdate);
  }

  static async getUserPreferences(
    trx: Transaction,
    userEntityId: string,
  ): Promise<UserPreferencesType> {
    const data: MdUserPreferences[] = await doUserPreferences.findAllByCol(
      trx,
      "upUserEntityId",
      userEntityId,
    );
    let userPreferences:UserPreferencesType = data.reduce(
      (accumObj, upPrefs) => ({
        ...accumObj,
        [upPrefs.upType]: upPrefs.upValue,
      }),
      {},
    );
    userPreferences = {
      ...defaultUserPreferences,
      ...userPreferences,
      weekNumberDisplay: userPreferences.weekNumberDisplay === "true",
    };
    return userPreferences;
  }

  static async getUserPreferenceByType(
    trx: Transaction,
    userEntityId: string,
    key: UserPreferencesKeyType,
  ): Promise<MdUserPreferences> {
    const userPreferenceByType: MdUserPreferences = await doUserPreferences.findOneByPredicate(trx, {
      upUserEntityId: userEntityId,
      upType: key,
    });
    return userPreferenceByType;
  }
}

export default SrUserPreferences;
