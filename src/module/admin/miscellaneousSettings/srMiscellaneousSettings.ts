import { Transaction } from "knex";
import { defaultMiscellaneousSettings } from "../../shared/data/dtUserPreferences";
import { MiscellaneousSettingsPayload, MiscellaneousSettingsKeyType, MiscellaneousSettingsType } from "../../shared/types/tpShared";
import DoMiscellaneousSettings from "./doMiscellaneousSettings";
import MdMiscellaneousSettings from "./mdMiscellaneousSettings";

class SrMiscellaneousSettings {
  static async updateMiscellaneousSettingsByType(
    trx: Transaction,
    userEntityId: string,
    data: MiscellaneousSettingsPayload,
  ): Promise<void> {
    const { payload } = data;
    const preferenceUpdate = Object.keys(payload).map(async (key) => {
      const value = payload[key];
      const existingUserPreferenceType = await DoMiscellaneousSettings.findOneByPredicate(trx, {
        msEntityId: userEntityId,
        msType: key,
      });
      if (existingUserPreferenceType) {
        await DoMiscellaneousSettings.updateOneByPredicate(
          trx,
          {
            msValue: value as string,
          },
          {
            msEntityId: userEntityId,
            msType: key,
          },
        );
      } else {
        await DoMiscellaneousSettings.insertOne(trx, {
          msEntityId: userEntityId,
          msValue: value as string,
          msType: key,
        });
      }
    });
    await Promise.all(preferenceUpdate);
  }

  static async getMiscellaneousSettings(
    trx: Transaction,
  ): Promise<MiscellaneousSettingsType> {
    const data: MdMiscellaneousSettings[] = await DoMiscellaneousSettings.getAll(trx);
    let miscellaneousSettings: MiscellaneousSettingsType = data.reduce(
      (accumObj, settings) => ({
        ...accumObj,
        [settings.msType]: settings.msValue,
      }),
      {},
    );
    miscellaneousSettings = {
      ...defaultMiscellaneousSettings,
      ...miscellaneousSettings,
    };
    return miscellaneousSettings;
  }

  static async getMiscellaneousSettingsByType(
    trx: Transaction,
    key: MiscellaneousSettingsKeyType,
  ): Promise<MdMiscellaneousSettings> {
    const miscellaneousSettingsByType: MdMiscellaneousSettings = await DoMiscellaneousSettings.findOneByPredicate(trx, {
      msType: key,
    });
    return miscellaneousSettingsByType;
  }
}

export default SrMiscellaneousSettings;
