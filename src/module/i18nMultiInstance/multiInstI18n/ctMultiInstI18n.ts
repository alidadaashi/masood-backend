import { Transaction } from "knex";
import { NextFunction, Request, Response } from "express";
import knex from "../../../base/database/cfgKnex";
import SrI18n, { srUpdateInstanceMultipleImpHaveInstanceId } from "./srMultiInstI18n";
import MdI18nTranslations from "../../i18n/i18nTranslations/mdI18nTranslations";
import { GridFilterStateType } from "../../shared/types/tpFilter";
import { DocumentTypeType } from "../../shared/types/tpShared";
import { utGetUserSession } from "../../shared/utils/utOther";
import { I18N_MAIN_ROUTE, I18N_MP_ROUTE } from "../../shared/constants/dtI18nModuleConstants";
import { utResolveQueryParamToPageId, utSeparateRecordByInstanceId } from "./utMultiInstI18n";
import { utGetSelectedInstanceIds } from "../../../routes/utAclHelper";
import { srExportTranslations, srI18nExtendExportableColumns, srI18nTransformDataFromUploadedFile } from "../i18nDocument/srI18nDocument";
import { ERR_UPLOAD_CORRECT_FILE, MESSAGE_TRANS_UPDATED, MESSAGE_TRANS_UPDATED_MI } from "../../shared/constants/dtOtherConstants";
import { utIsItgAdminUser } from "../../shared/utils/utSession";
import {
  TI18nUpdateMultiInstTranslationData, TI18nUpdateTranslationData, TI18nUpdateTranslationMultipleImp,
} from "../../shared/types/tpI18n";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { utGetLanguagesByUser } from "../languages/utLanguages";

class CtMultiInstanceI18n {
  static async getAllTranslations(
    req: Request<{ transType: MdI18nTranslations["itType"] }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);
      const {
        exportType, exports, module, page, ...filters
      } = req.query as unknown as GridFilterStateType & { exportType?: DocumentTypeType, module?: string, page?: string };
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const pageId = module && page ? await utResolveQueryParamToPageId(trx, { module, page }) : undefined;
        if (!pageId && module && page) res.sendList({ list: [], total: 0 });
        else {
          const userSelectedInstances = sessionUser.userInstances ? utGetSelectedInstanceIds(sessionUser.userInstances) : [];
          const transType = (req.params.transType?.trim() || null) as MdI18nTranslations["itType"];
          const [qb, languagesModels] = userSelectedInstances.length > 0
            ? await SrI18n.getAllMultiInstanceTranslations(trx, transType, filters, {
              pageId, uEntityId: sessionUser.uEntityId, selectedInstanceIds: userSelectedInstances,
            })
            : await SrI18n.getAllSystemTranslations(trx, transType, { pageId, filters, uEntityId: sessionUser.uEntityId });
          const { data, total } = await qb;
          if (exportType) {
            const [updatedData, updatedExports, fieldKeysRows] = srI18nExtendExportableColumns(
              exports, languagesModels, data, I18N_MAIN_ROUTE,
            );
            await srExportTranslations(req, res, updatedExports, { exportType, data: [fieldKeysRows, ...updatedData] });
          } else {
            res.sendList({ list: data, total });
          }
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateTranslations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);
      const { filterNotHaveInstanceId, filterHaveInstanceId } = utSeparateRecordByInstanceId(req.body);
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const userSelectedInstances = sessionUser.userInstances ? utGetSelectedInstanceIds(sessionUser.userInstances) : [];
        if (utIsItgAdminUser(sessionUser) && userSelectedInstances.length === 0) {
          await SrI18n.updateTranslations(trx, req.body);
        } else {
          if (filterNotHaveInstanceId.length > 0) {
            await Promise.all(userSelectedInstances.map(
              (instanceEntityId) => SrI18n.updateTranslationsForInstance(trx, instanceEntityId,
                filterNotHaveInstanceId as unknown as TI18nUpdateTranslationData[]),
            ));
          }
          if (filterHaveInstanceId.length > 0) {
            const result = filterHaveInstanceId.reduce((acc: {
              [x: string]: TI18nUpdateMultiInstTranslationData[];
            },
            item: TI18nUpdateMultiInstTranslationData) => {
              acc[item.instanceId] = (acc[item.instanceId] || []);
              acc[item.instanceId].push(item);
              return acc;
            }, {});

            await Promise.all(Object.keys(result).map(
              (instanceEntityId) => SrI18n.updateTranslationsForInstance(trx, instanceEntityId,
                result[instanceEntityId] as unknown as TI18nUpdateTranslationData[]),
            ));
          }
        }
        res.sendMsg(MESSAGE_TRANS_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async saveMultiInstanceI18nTranslations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionUser = utGetUserSession(req);
      const userSelectedInstances = sessionUser.userInstances ? utGetSelectedInstanceIds(sessionUser.userInstances) : [];
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const transformData = await srI18nTransformDataFromUploadedFile(trx, req, sessionUser);
        const { filterNotHaveInstanceId, filterHaveInstanceId } = utSeparateRecordByInstanceId(transformData);
        if (utIsItgAdminUser(sessionUser) && userSelectedInstances.length === 0) {
          await SrI18n.updateTranslations(trx, filterNotHaveInstanceId as unknown as TI18nUpdateTranslationData[]);
        } else {
          if (filterNotHaveInstanceId.length > 0) {
            await Promise.all(userSelectedInstances.map(
              (instanceEntityId) => SrI18n.updateTranslationsForInstance(trx, instanceEntityId,
                filterNotHaveInstanceId as unknown as TI18nUpdateTranslationData[]),
            ));
          }
          if (filterHaveInstanceId.length > 0) {
            const result = filterHaveInstanceId.reduce((acc: {
              [x: string]: TI18nUpdateMultiInstTranslationData[];
            },
            item: TI18nUpdateMultiInstTranslationData) => {
              acc[item.instanceId] = (acc[item.instanceId] || []);
              acc[item.instanceId].push(item);
              return acc;
            }, {});

            await Promise.all(Object.keys(result).map(
              (instanceEntityId) => SrI18n.updateTranslationsForInstance(trx, instanceEntityId,
                result[instanceEntityId] as unknown as TI18nUpdateTranslationData[]),
            ));
          }
        }
        res.sendMsg(MESSAGE_TRANS_UPDATED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async handleSaveMultiInstanceI18nTranslations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const routeFromData = req.body.map((item: { i18nRouteName: string; }) => item?.i18nRouteName);
      const isAllRouteSame = routeFromData.every((item: string) => item === routeFromData[0]);
      if (isAllRouteSame) {
        const route = routeFromData[0];
        if (route === I18N_MAIN_ROUTE) CtMultiInstanceI18n.saveMultiInstanceI18nTranslations(req, res, next);
      } else {
        throw new MdUnprocessableEntityError(ERR_UPLOAD_CORRECT_FILE);
      }
    } catch (e) {
      next(e);
    }
  }

  static async getInstancesMultiImplementations(
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
        const userSelectedInstances = sessionUser.userInstances ? utGetSelectedInstanceIds(sessionUser.userInstances) : [];
        const { data, total } = await SrI18n.getInstancesMultiImplementations(trx, slugId, filters, userSelectedInstances);
        if (exportType) {
          const languagesModels = await utGetLanguagesByUser(trx, sessionUser);
          const [updatedData, updatedExports, fieldKeysRows] = srI18nExtendExportableColumns(
            exports, languagesModels, data, I18N_MP_ROUTE,
          );
          await srExportTranslations(req, res, updatedExports, { data: [fieldKeysRows, ...updatedData], exportType });
        } else {
          res.sendList({ list: data, total });
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateTranslationsInstancesMultipleImp(
    req: Request<{ slugId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx: Transaction): Promise<void> => {
        const sessionUser = utGetUserSession(req);
        const userSelectedInstances = sessionUser.userInstances ? utGetSelectedInstanceIds(sessionUser.userInstances) : [];
        const { filterNotHaveInstanceId, filterHaveInstanceId } = utSeparateRecordByInstanceId(req.body);
        if (utIsItgAdminUser(sessionUser) && userSelectedInstances.length === 0) {
          await SrI18n.updateInstancesMultipleImpTranslationsBulk(trx, req.body, null);
        } else {
          if (filterNotHaveInstanceId.length > 0) {
            await Promise.all(userSelectedInstances.map(
              (instanceEntityId) => SrI18n.updateInstancesMultipleImpTranslationsBulk(trx,
                filterNotHaveInstanceId as unknown as TI18nUpdateTranslationMultipleImp[], instanceEntityId || null),
            ));
          }
          if (filterHaveInstanceId.length > 0) {
            await srUpdateInstanceMultipleImpHaveInstanceId(filterHaveInstanceId, trx);
          }
        }
        res.sendMsg(MESSAGE_TRANS_UPDATED_MI);
      });
    } catch (e) {
      next(e);
    }
  }
}
export default CtMultiInstanceI18n;
