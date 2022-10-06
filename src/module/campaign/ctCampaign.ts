import { NextFunction, Request, Response } from "express";
import { QueryBuilder, Transaction } from "knex";
import knex from "../../base/database/cfgKnex";
import { utGetUserSession } from "../shared/utils/utOther";
import { srBuildFilterCriteria } from "../shared/services/filters/srFilter";
import { utCountTotalByQb } from "../shared/utils/utData";
import SrUserSelectedInstance from "../user/userSelectedInstance/srUserSelectedInstance";
import { GridFilterStateType } from "../shared/types/tpFilter";
import { utUpdateCampSuppStatusToViewed } from "./utCampaign";
import {
  utGetCampDetailsExcelFieldsConfigs, utGetCampDetailsExcelFieldsConfigsForSupplier, utGetExportDocType,
  utIsExportDataRequest, utSendExportDocument,
} from "../../vedi/dataMigration/utils/utExports";
import srCampaign from "./srCampaign";
import {
  MESSAGE_CAMPAIGN_CREATED, MESSAGE_CAMPAIGN_STATUS_CHANGED, MESSAGE_PERMISSION_DENIED,
}
  from "../shared/constants/dtOtherConstants";
import { utReqGetMetaData } from "../shared/utils/utRequest";
import { utGetColumnsForExport } from "../shared/utils/utExcel";
import { COL_TRANS_ROW_CAMPAIGN_ID } from "../shared/constants/dtI18nModuleConstants";
import SrAclGuardCampaign from "../../routes/srAclGuardCampaign";
import MdUnprocessableEntityError from "../../base/errors/mdUnprocessableEntityError";
import doCampaignSupplier from "./campaignSupplier/doCampaignSupplier";
import doEntity from "../entity/doEntity";
import SrUserPreferences from "../preferences/userPreference/srUserPreferences";
import { utGetAllDataIdsArray } from "../shared/utils/utFilter";

const srGetFilteredQbAndAllDataIds = async (
  trx: Transaction,
  getAllQb: QueryBuilder,
  filters: GridFilterStateType,
  dbRowId: string,
) => {
  const isSelectAllRows = (filters.isSelectAllRows as unknown as string === "true");
  const allIds = isSelectAllRows ? await utGetAllDataIdsArray(trx, getAllQb, dbRowId) : [];
  const qbWithFilters = srBuildFilterCriteria(getAllQb, filters, undefined, false);
  const data = await qbWithFilters;
  const total = data.length ? await utCountTotalByQb(qbWithFilters) : 0;
  return { data, allIds, total };
};
class CtCampaign {
  static async getAllCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = utGetUserSession(req);
      const { exports, ...filters } = req.query as unknown as GridFilterStateType;
      await knex.transaction(async (trx) => {
        const qb = SrAclGuardCampaign.srGetCampaignListViewQb(trx, session.uEntityId, session);
        if (qb) {
          const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
            .getSelectedInstance(trx, session.uEntityId) || {};
          const getAllQb = srCampaign.getAllCampaignsByQb(trx, qb, usiSelectedInstanceEntityId as string);
          const { allIds, data, total } = await srGetFilteredQbAndAllDataIds(trx, getAllQb, filters, "csId");
          if (utIsExportDataRequest(req)) {
            await utSendExportDocument(res, data, exports, {
              docConfigs: {
                documentType: utGetExportDocType(req),
                docTitle: "Campaigns",
                docFilename: "campaigns-list",
              },
            });
          } else {
            res.sendList({ list: data, total, allIds });
          }
        } else {
          res.sendList({ list: [], total: 0, allIds: [] });
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllCampaignsForSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = utGetUserSession(req);
      const { exports, ...filters } = req.query as unknown as GridFilterStateType;
      await knex.transaction(async (trx) => {
        const qb = SrAclGuardCampaign.srGetSupplierCampaignListViewQb(trx, session);
        if (qb) {
          const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
            .getSelectedInstance(trx, session.uEntityId) || {};
          const getAllQb = srCampaign.getAllCampaignsForSupplierByQb(trx, qb, usiSelectedInstanceEntityId as string);
          const { allIds, data, total } = await srGetFilteredQbAndAllDataIds(trx, getAllQb, filters, "csId");
          if (utIsExportDataRequest(req)) {
            await utSendExportDocument(res, data, exports, {
              docConfigs: {
                documentType: utGetExportDocType(req),
                docTitle: "Campaigns",
                docFilename: "campaigns-list",
              },
            });
          } else {
            res.sendList({ list: data, total, allIds });
          }
        } else {
          res.sendList({ list: [], total: 0, allIds: [] });
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async getCampaignDetails(
    req: Request<{ campaignSupplierId: string }>, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      const { filters: { exports, ...filters } } = utReqGetMetaData(req);
      const { campaignSupplierId } = req.params;
      await knex.transaction(async (trx) => {
        const campaignDetails = await srCampaign.getCampaignDetails(trx, campaignSupplierId, filters);
        const userPrefNumFormat = (
          await SrUserPreferences.getUserPreferenceByType(trx, session.uEntityId, "numFmt")
        ).upValue as string;
        if (exports && utIsExportDataRequest(req)) {
          const exportableColumns = [COL_TRANS_ROW_CAMPAIGN_ID];
          const updatedExports = utGetColumnsForExport(exports, exportableColumns);
          const fieldKeysRows = updatedExports?.columns.reduce((accum, col) => ({ ...accum, [col.field]: [col.field] }), {});
          await utSendExportDocument(res, [fieldKeysRows, ...campaignDetails.list], updatedExports, {
            prefNumFormat: userPrefNumFormat,
            excelDocFieldConfigs: utGetCampDetailsExcelFieldsConfigs(updatedExports, campaignDetails),
            docConfigs: {
              documentType: utGetExportDocType(req),
              docTitle: "Campaign Details",
              docFilename: "campaigns-details",
            },
          });
        } else {
          res.sendList(campaignDetails);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async getCampaignDetailsForSupplier(
    req: Request<{ campaignSupplierId: string }>, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const { filters: { exports, ...filters } } = utReqGetMetaData(req);
      const session = utGetUserSession(req);
      const { campaignSupplierId } = req.params;
      await knex.transaction(async (trx) => {
        const campaignDetails = await srCampaign.getCampaignDetails(trx, campaignSupplierId, filters);
        const userPrefNumFormat = (
          await SrUserPreferences.getUserPreferenceByType(trx, session.uEntityId, "numFmt")
        ).upValue as string;
        if (exports && utIsExportDataRequest(req)) {
          const exportableColumns = [COL_TRANS_ROW_CAMPAIGN_ID];
          const updatedExports = utGetColumnsForExport(exports, exportableColumns);
          const fieldKeysRows = updatedExports?.columns.reduce((accum, col) => ({ ...accum, [col.field]: [col.field] }), {});
          await utSendExportDocument(res, [fieldKeysRows, ...campaignDetails.list], updatedExports, {
            prefNumFormat: userPrefNumFormat,
            excelDocFieldConfigs: utGetCampDetailsExcelFieldsConfigsForSupplier(updatedExports, campaignDetails),
            docConfigs: {
              documentType: utGetExportDocType(req),
              docTitle: "Campaign Details",
              docFilename: "campaigns-details",
            },
          });
        } else {
          await utUpdateCampSuppStatusToViewed(trx, req.params.campaignSupplierId, session);
          res.sendList(campaignDetails);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateCampaignsStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = utGetUserSession(req);
      let qb = null;
      const { campSuppliersIds } = req.body;
      await knex.transaction(async (trx) => {
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, session.uEntityId) || {};
        const campaignSupplier = await doCampaignSupplier.findOneByCol(trx, "csId", campSuppliersIds[0]);
        const entity = await doEntity.findOneByCol(trx, "entityId", usiSelectedInstanceEntityId as string);
        if (entity.entityType === "business-partner") {
          qb = await SrAclGuardCampaign.canUpdateSupplierCampaignDetails(
            trx, session, usiSelectedInstanceEntityId as string,
          );
        } else {
          qb = await SrAclGuardCampaign.canUpdateCampaignDetails(trx, {
            userEntityId: session.uEntityId,
            updatingCampId: campaignSupplier.csCampId,
            privs: session,
            updatingCampInstanceId: usiSelectedInstanceEntityId as string,
          });
        }
        if (qb) {
          await srCampaign.updateCampaignsStatus(trx, req.body, session);
          res.sendMsg(MESSAGE_CAMPAIGN_STATUS_CHANGED);
        } else {
          throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async getCampaignsSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = utGetUserSession(req);
      const { exports, ...filters } = req.query as unknown as GridFilterStateType;
      await knex.transaction(async (trx) => {
        const { usiSelectedInstanceEntityId } = await SrUserSelectedInstance
          .getSelectedInstance(trx, session.uEntityId) || {};
        const campaignsSummaryQb = SrAclGuardCampaign.srGetCampaignsSummaryViewQb(
          trx, session.uEntityId, session, usiSelectedInstanceEntityId as string,
        );
        if (campaignsSummaryQb) {
          const wrappedQbInSubQueryForFilters = knex.select("*").from(campaignsSummaryQb.as("SUBQ"));
          const campaignsSummary = await srBuildFilterCriteria(
            wrappedQbInSubQueryForFilters, filters, undefined, false,
          );
          if (utIsExportDataRequest(req)) {
            await utSendExportDocument(res, campaignsSummary, exports, {
              docConfigs: {
                documentType: utGetExportDocType(req),
                docTitle: "Campaigns Summary",
                docFilename: "campaigns-summary",
              },
            });
          } else {
            const total = campaignsSummary.length ? await utCountTotalByQb(wrappedQbInSubQueryForFilters) : 0;
            res.sendList({ list: campaignsSummary, total });
          }
        } else {
          res.sendList({ list: [], total: 0 });
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async tempCreateCampaign(req: Request<{ instanceId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        await srCampaign.tempCreateCampaign(trx, instanceId, session);
        res.sendMsg(MESSAGE_CAMPAIGN_CREATED);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtCampaign;
