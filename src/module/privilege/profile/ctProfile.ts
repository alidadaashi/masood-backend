import { NextFunction, Request, Response } from "express";
import ProfileDao from "./doProfile";
import knex from "../../../base/database/cfgKnex";
import { utCountTotalByQb, utGetExportableColumns } from "../../shared/utils/utData";
import { DocumentTypeType } from "../../shared/types/tpShared";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import SrGenerateDocument from "../../shared/services/srGenerateDocument";
import { utIsItgAdmin } from "../../shared/utils/utAuth";
import { utGetUserSession } from "../../shared/utils/utOther";
import { srBuildFilterCriteria } from "../../shared/services/filters/srFilter";
import { GridFilterStateType } from "../../shared/types/tpFilter";
import { ERR_DOCUMENT_TYPE_REQUIRED } from "../../shared/constants/dtOtherConstants";
import SrUserPreferences from "../../preferences/userPreference/srUserPreferences";
import cfgApp from "../../../base/configs/cfgApp";
import { utGetAllDataIdsArray } from "../../shared/utils/utFilter";

class CtProfile {
  static async getAllProfiles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      if (utIsItgAdmin(session)) {
        await knex.transaction(async (trx) => {
          const qb = ProfileDao.findAllByPredicate(trx, {
            pProfileStatus: "active",
          }, ["pProfileId", "pProfileName", "pProfileCreatedAt"]);
          const query = req.query as unknown as GridFilterStateType;
          const isSelectAllRows = (query.isSelectAllRows as unknown as string === "true");
          const qbWithFilters = srBuildFilterCriteria(qb, query);
          const data = await qbWithFilters;
          const total = data.length > 0 ? await utCountTotalByQb(qbWithFilters) : 0;
          res.sendList({
            list: data,
            total,
            allIds: isSelectAllRows ? await utGetAllDataIdsArray(trx, qb, "pProfileId") : [],
          });
        });
      } else {
        res.sendList({
          list: [],
          total: 0,
          allIds: [],
        });
      }
    } catch (e) {
      next(e);
    }
  }

  static async generateDocument(
    req: Request<{ documentType: DocumentTypeType }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (req.params.documentType) {
        await knex.transaction(async (trx) => {
          const qb = ProfileDao.findAllByPredicate(trx, {
            pProfileStatus: "active",
          }, ["pProfileId", "pProfileName", "pProfileCreatedAt"]);
          const { exports, ...filters } = req.query as unknown as GridFilterStateType;
          const data = await srBuildFilterCriteria(qb, filters);
          const colsToExport = utGetExportableColumns(exports);
          const session = utGetUserSession(req);
          const getDateFormat = await SrUserPreferences.getUserPreferenceByType(trx, session.uEntityId, "dateDisplayFormat");
          const dateFormat = getDateFormat?.upValue as string || cfgApp.appUniversalMomentDateFormat;
          const bufferData = await SrGenerateDocument
            .generateDocumentByType(data, req.params.documentType, colsToExport,
              { heading: exports?.title || "Privileges Profiles List", dateDisplayFormat: dateFormat });
          SrGenerateDocument.setAttachmentType(res, exports?.filename || "profiles-list", req.params.documentType);
          res.send(bufferData);
        });
      } else {
        throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_REQUIRED);
      }
    } catch (e) {
      next(e);
    }
  }
}

export default CtProfile;
