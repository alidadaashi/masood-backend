import { Transaction } from "knex";
import { NextFunction, Request, Response } from "express";
import knex from "../../../base/database/cfgKnex";
import SrI18n from "./srI18n";
import MdI18nTranslations from "../i18nTranslations/mdI18nTranslations";
import { GridFilterStateType } from "../../shared/types/tpFilter";
import { utGetReqLanguage } from "../../shared/utils/utRequest";
import { utResolveQueryParamToPageId } from "./utI18n";
import { utIsItgAdminUser, utBroadcastTranslateUpdateNotificationToAll } from "../../shared/utils/utSession";
import SrUserSelectedInstance from "../../user/userSelectedInstance/srUserSelectedInstance";
import { utGetUserSession } from "../../shared/utils/utOther";
import MdUserSelectedInstance from "../../user/userSelectedInstance/mdUserSelectedInstance";
import { ERR_UPLOAD_CORRECT_FILE, MESSAGE_TRANS_UPDATED, MESSAGE_TRANS_UPDATED_MI } from "../../shared/constants/dtOtherConstants";
import { DocumentTypeType } from "../../shared/types/tpShared";
import {
  srExportTranslations, srI18nTransformDataFromUploadedFile, srI18nExtendExportableColumns,
  srI18nDynamicExtendExportableColumns, srI18nDynamicTransformDataFromUploadedFile,
} from "../i18nDocument/srI18nDocument";
import { TI18nUpdateTranslationData, TI18nUpdateTranslationMultipleImp } from "../../shared/types/tpI18n";
import { utGetLanguagesByUser } from "../languages/utLanguages";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { I18N_MAIN_ROUTE, I18N_MP_ROUTE, I18N_DYNAMIC_ROUTE } from "../../shared/constants/dtI18nModuleConstants";
import SrUserPreferences from "../../preferences/userPreference/srUserPreferences";
import { utGetMultipleImplementationForUpdate } from "../i18nMultipleImplementation/sri18nMultipleImplementation";
import { utGetCampDetailsExcelFieldsConfigsForI18n } from "../../../vedi/dataMigration/utils/utExports";

class CtI18n {
  static async getAllTranslations(
    req: Request<{ transType: MdI18nTranslations["itType"] }>,
    res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);
      const language = utGetReqLanguage(req);
      const {
        exportType, exports, module, page, ...filters
      } = req.query as unknown as GridFilterStateType & { exportType?: DocumentTypeType, module?: string, page?: string };
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const pageId = module && page ? await utResolveQueryParamToPageId(trx, { module, page }) : undefined;
        if (!pageId && module && page) res.sendList({ list: [], total: 0, allIds: [] });
        else {
          const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
            .getSelectedInstance(trx, sessionUser.uEntityId) || {};
          const transType = (req.params.transType?.trim() || null) as MdI18nTranslations["itType"];
          const [qb, languagesModels] = !usiSelectedInstanceEntityId
            ? await SrI18n.getAllTranslations(trx, transType, { filters, language, pageId })
            : await SrI18n.getAllInstanceTranslations(trx, transType, filters, {
              language, pageId, selectedInstanceId: usiSelectedInstanceEntityId as string,
            });
          const { data, total, allIds } = await qb;
          if (exportType) {
            const [updatedData, updatedExports, fieldKeysRows] = srI18nExtendExportableColumns(
              exports, languagesModels, data, I18N_MAIN_ROUTE,
            );
            await srExportTranslations(req, res, updatedExports, {
              exportType,
              data: [fieldKeysRows, ...updatedData],
              excelDocFieldConfigs: utGetCampDetailsExcelFieldsConfigsForI18n(updatedExports,
                [fieldKeysRows, ...updatedData], I18N_MAIN_ROUTE),
            });
          } else {
            res.sendList({ list: data, total, allIds });
          }
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateTranslations(
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        if (utIsItgAdminUser(sessionUser)) await SrI18n.updateTranslations(trx, req.body);
        else {
          const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
            .getSelectedInstance(trx, sessionUser.uEntityId) as MdUserSelectedInstance;
          await SrI18n.updateTranslationsForInstance(trx, usiSelectedInstanceEntityId, req.body);
        }
        res.sendMsg(MESSAGE_TRANS_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateTranslationsMultipleImp(
    req: Request<{ slugId: string }>,
    res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const sessionUser = utGetUserSession(req);
        const selectedUserInstance = await SrUserSelectedInstance.getSelectedInstance(trx, sessionUser.uEntityId);

        await SrI18n.updateMultipleImpTranslationsBulk(trx, req.body, req.params.slugId,
          selectedUserInstance?.usiSelectedInstanceEntityId || null);
        res.sendMsg(MESSAGE_TRANS_UPDATED_MI);
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateDynamicTranslationsForSlug(
    req: Request<{ slugId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const sessionUser = utGetUserSession(req);
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, sessionUser.uEntityId) as MdUserSelectedInstance;
        await SrI18n.updateDynamicTranslationsForSlug(trx, req.body, req.params.slugId, usiSelectedInstanceEntityId);
        res.sendMsg(MESSAGE_TRANS_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getMultipleImplementations(
    req: Request<{ slugId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);

      const {
        exportType, ...filters
      } = req.query as unknown as GridFilterStateType & { exportType?: DocumentTypeType };
      const { exports } = req.query as unknown as GridFilterStateType;
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const { slugId } = req.params;
        const {
          usiSelectedInstanceEntityId,
        } = await SrUserSelectedInstance.getSelectedInstance(trx, sessionUser?.uEntityId) || {};
        const { data, total, allIds } = await SrI18n.getMultipleImplementations(trx, slugId, filters, {
          selectedInstanceId: usiSelectedInstanceEntityId || null,
        });
        if (exportType) {
          const languagesModels = await utGetLanguagesByUser(trx, sessionUser);
          const [updatedData, updatedExports, fieldKeysRows] = srI18nExtendExportableColumns(
            exports, languagesModels, data, I18N_MP_ROUTE,
          );
          await srExportTranslations(req, res, updatedExports, {
            data: [fieldKeysRows, ...updatedData],
            exportType,
            excelDocFieldConfigs: utGetCampDetailsExcelFieldsConfigsForI18n(updatedExports,
              [fieldKeysRows, ...updatedData], I18N_MP_ROUTE),
          });
        } else {
          res.sendList({ list: data, total, allIds });
        }
      });
    } catch (e) { next(e); }
  }

  static async getScreenTexts(
    req: Request<{ lang?: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const sessionUser = req.session.user;
        let selectedUserInstance;
        let userLangPref = req.params.lang;
        if (sessionUser) {
          selectedUserInstance = await SrUserSelectedInstance.getSelectedInstance(trx, sessionUser.uEntityId);
          const langPref = (await SrUserPreferences.getUserPreferenceByType(trx, sessionUser.uEntityId, "language"));
          userLangPref = langPref?.upValue as string;
        }
        const screenText = await SrI18n
          .getScreenText(trx, userLangPref, selectedUserInstance?.usiSelectedInstanceEntityId);
        res.sendObject({ screenText });
      });
    } catch (e) { next(e); }
  }

  static async getDynamicTranslationsForSlug(
    req: Request<{ slugId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        exportType, exports, ...filters
      } = req.query as unknown as GridFilterStateType & { exportType?: DocumentTypeType };
      const sessionUser = utGetUserSession(req);
      const language = utGetReqLanguage(req);
      const { slugId } = req.params;
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, sessionUser.uEntityId) || {};
        const { data, total, allIds } = await SrI18n.getDynamicTranslationsForSlug(trx, language, {
          slugId, filters, selectedInstanceId: usiSelectedInstanceEntityId as string,
        });
        if (exportType) {
          const updatedDataWithSlug = data.map((item) => ({ ...item, slugId, i18nRouteName: I18N_DYNAMIC_ROUTE }));
          const languagesModels = await utGetLanguagesByUser(trx, sessionUser);
          const [updatedExports, fieldKeysRows] = srI18nDynamicExtendExportableColumns(exports, languagesModels);
          await srExportTranslations(req, res, updatedExports,
            {
              exportType,
              data: [fieldKeysRows, ...updatedDataWithSlug],
              excelDocFieldConfigs: utGetCampDetailsExcelFieldsConfigsForI18n(updatedExports,
                [fieldKeysRows, ...updatedDataWithSlug], I18N_DYNAMIC_ROUTE),
            });
        } else {
          res.sendList({ list: data, total, allIds });
        }
      });
    } catch (e) { next(e); }
  }

  static async saveI18nTranslations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const transformData = await srI18nTransformDataFromUploadedFile(trx, req, sessionUser);
        if (utIsItgAdminUser(sessionUser)) {
          await SrI18n.updateTranslations(trx, transformData as TI18nUpdateTranslationData[]);
        } else {
          const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
            .getSelectedInstance(trx, sessionUser.uEntityId) as MdUserSelectedInstance;
          await SrI18n.updateTranslationsForInstance(trx, usiSelectedInstanceEntityId,
            transformData as TI18nUpdateTranslationData[]);
        }
        res.sendMsg(MESSAGE_TRANS_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async saveI18nMultipleImplementationTranslations(
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const transformData = await srI18nTransformDataFromUploadedFile(trx, req, sessionUser);
        const selectedUserInstance = await SrUserSelectedInstance.getSelectedInstance(trx, sessionUser.uEntityId);
        const translationsForUpdate = utGetMultipleImplementationForUpdate(transformData);
        if (translationsForUpdate) {
          const promiseArr: unknown[] = [];
          Object.keys(translationsForUpdate).map((key) => promiseArr.push(
            SrI18n.updateMultipleImpTranslationsBulk(trx,
              translationsForUpdate[key] as unknown as TI18nUpdateTranslationMultipleImp[], key,
              selectedUserInstance?.usiSelectedInstanceEntityId || null),
          ));
          await Promise.all(promiseArr);
          utBroadcastTranslateUpdateNotificationToAll();
          res.sendMsg(MESSAGE_TRANS_UPDATED_MI);
        } else {
          throw new MdUnprocessableEntityError(ERR_UPLOAD_CORRECT_FILE);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async saveI18nDynamicTranslations(
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const transformData = await srI18nDynamicTransformDataFromUploadedFile(trx, req, sessionUser);
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, sessionUser.uEntityId) as MdUserSelectedInstance;
        const isAllSlugIdsSame = transformData.every((item) => item.slugId === transformData[0].slugId);
        if (isAllSlugIdsSame && transformData[0].slugId) {
          await SrI18n.updateDynamicTranslationsForSlug(trx,
            transformData, transformData[0].slugId, usiSelectedInstanceEntityId);
          res.sendMsg(MESSAGE_TRANS_UPDATED);
        } else {
          throw new MdUnprocessableEntityError(ERR_UPLOAD_CORRECT_FILE);
        }
      });
    } catch (e) { next(e); }
  }

  static async handleSaveI18nTranslations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const routeFromData = req.body.map((item: { i18nRouteName: string; }) => item?.i18nRouteName);
      const isAllRouteSame = routeFromData.every((item: string) => item === routeFromData[0]);
      if (isAllRouteSame) {
        const route = routeFromData[0];
        if (route === I18N_MAIN_ROUTE) CtI18n.saveI18nTranslations(req, res, next);
        if (route === I18N_MP_ROUTE) CtI18n.saveI18nMultipleImplementationTranslations(req, res, next);
        if (route === I18N_DYNAMIC_ROUTE) CtI18n.saveI18nDynamicTranslations(req, res, next);
      } else {
        throw new MdUnprocessableEntityError(ERR_UPLOAD_CORRECT_FILE);
      }
    } catch (e) { next(e); }
  }
}

export default CtI18n;
