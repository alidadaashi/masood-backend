import { Transaction } from "knex";
import { UserUxPreferenecesPayload, UserUxPreferenecesType, UxPreferencesKeyType } from "../../shared/types/tpShared";
import doUserUxPreference from "./doUserUxPreference";
import MdUserUxPreference from "./mdUserUxPreference";

class SrUserUxPreference {
  static async updateUserUxPreference(
    trx: Transaction,
    userEntityId: string,
    key: UxPreferencesKeyType,
    data: UserUxPreferenecesPayload,
  ): Promise<void> {
    const { payload } = data;
    const existingUxPreferenceType = await doUserUxPreference.findOneByPredicate(trx, {
      uxpUserEntityId: userEntityId,
      uxpType: key,
    });
    if (existingUxPreferenceType) {
      await doUserUxPreference.updateOneByPredicate(trx, {
        uxpValue: JSON.stringify(payload),
      }, {
        uxpUserEntityId: userEntityId,
        uxpType: key,
      });
    } else {
      await doUserUxPreference.insertOne(trx, {
        uxpType: key,
        uxpUserEntityId: userEntityId,
        uxpValue: JSON.stringify(payload),
      });
    }
  }

  static async getUserUxPreferences(
    trx: Transaction,
    userEntityId: string,
  ): Promise<UserUxPreferenecesType> {
    const data: MdUserUxPreference[] = await doUserUxPreference.findAllByCol(trx, "uxpUserEntityId", userEntityId);
    const uxPreferences = data.reduce((accumObj, uxPrefs) => (
      { ...accumObj, [uxPrefs.uxpType]: uxPrefs.uxpValue }
    ), {});
    return uxPreferences;
  }

  static async getUserUxPreferenceByType(
    trx: Transaction,
    userEntityId: string,
    key: UxPreferencesKeyType,
  ): Promise<MdUserUxPreference> {
    const uxPreferenceByType: MdUserUxPreference = await doUserUxPreference.findOneByPredicate(trx, {
      uxpUserEntityId: userEntityId,
      uxpType: key,
    });
    return uxPreferenceByType;
  }
}

export default SrUserUxPreference;
