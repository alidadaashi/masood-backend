import { Transaction } from "knex";
import MdLanguages from "./mdLanguages";
import DoLanguages from "./doLanguages";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { UserSessionType } from "../../shared/types/tpShared";
import { utBroadcastTranslateUpdateNotificationToAll, utIsItgAdminUser } from "../../shared/utils/utSession";
import { srGetAllLanguages, srGetDefaultLanguage } from "./utLanguages";
import DoI18nInstance from "../i18nInstance/doI18nInstance";
import MdI18nInstance from "../i18nInstance/mdI18nInstance";
import { ERR_LANG_ALREADY_EXISTS, MESSAGE_PERMISSION_DENIED } from "../../shared/constants/dtOtherConstants";
import SrUserSelectedInstance from "../../user/userSelectedInstance/srUserSelectedInstance";

class SrLanguages {
  static async getAllLanguages(
    trx: Transaction,
    sessionUser?: UserSessionType,
  ):Promise<(MdLanguages&{ disabled?:boolean })[]> {
    let selectedUserInstance;
    if (sessionUser) selectedUserInstance = await SrUserSelectedInstance.getSelectedInstance(trx, sessionUser?.uEntityId);
    return srGetAllLanguages(trx, selectedUserInstance?.usiSelectedInstanceEntityId);
  }

  static async updateLanguages(
    trx: Transaction,
    sessionUser: UserSessionType,
    languages: (Pick<MdLanguages, "lId"|"lStatus">&{instanceId: string})[],
    selectedInstanceId?: string,
  ):Promise<void> {
    const defaultLang = await srGetDefaultLanguage(trx);
    const filteredLanguages = languages.filter((lang) => lang.lId !== defaultLang.lId);

    if (selectedInstanceId) {
      const instanceLanguages = filteredLanguages.map((
        lang,
      ): MdI18nInstance => ({ iiInstanceId: selectedInstanceId, iiLanguageId: lang.lId as string, iiStatus: lang.lStatus }));
      await DoI18nInstance.upsertMany(trx, instanceLanguages, ["iiInstanceId", "iiLanguageId"]);
      utBroadcastTranslateUpdateNotificationToAll();
    } else {
      const updatedLanguages = filteredLanguages.map((lang) => DoLanguages
        .updateOneByColName(trx, { lStatus: lang.lStatus }, "lId", lang.lId as string));
      await Promise.all(updatedLanguages);
      utBroadcastTranslateUpdateNotificationToAll();
    }
  }

  static async addLanguage(
    trx: Transaction,
    { lShortName, lFullName, lStatus }: Pick<MdLanguages, "lShortName"|"lFullName"|"lStatus">,
    sessionUser: UserSessionType,
  ):Promise<void> {
    if (!utIsItgAdminUser(sessionUser)) throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
    const langShortName = lShortName?.trim() || "";
    const isLangExists = await DoLanguages.findOneByCol(trx, "lShortName", langShortName);
    if (!isLangExists) {
      await DoLanguages.insertOne(trx, {
        lShortName: langShortName, lFullName, lStatus,
      });
      utBroadcastTranslateUpdateNotificationToAll();
    } else {
      throw new MdUnprocessableEntityError(ERR_LANG_ALREADY_EXISTS);
    }
  }
}

export default SrLanguages;
