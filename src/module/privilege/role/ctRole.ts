import { NextFunction, Request, Response } from "express";
import knex from "../../../base/database/cfgKnex";
import DoRole from "./doRole";
import { utCountTotalByQb, utGetExportableColumns } from "../../shared/utils/utData";
import { DocumentTypeType } from "../../shared/types/tpShared";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import SrGenerateDocument from "../../shared/services/srGenerateDocument";
import SrRole from "./srRole";
import { utIsItgAdmin } from "../../shared/utils/utAuth";
import { utGetUserSession } from "../../shared/utils/utOther";
import { srBuildFilterCriteria } from "../../shared/services/filters/srFilter";
import { GridFilterStateType } from "../../shared/types/tpFilter";
import { ERR_DOCUMENT_TYPE_REQUIRED, MESSAGE_ROLE_DELETED } from "../../shared/constants/dtOtherConstants";
import SrUserPreferences from "../../preferences/userPreference/srUserPreferences";
import cfgApp from "../../../base/configs/cfgApp";
import { utGetAllDataIdsArray } from "../../shared/utils/utFilter";

class CtRole {
  static async getAllRoles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      if (utIsItgAdmin(session)) {
        await knex.transaction(async (trx) => {
          const qb = DoRole.findAllByPredicate(trx, {
            rRoleStatus: "active",
          }, ["rRoleId", "rRoleName", "rRoleCreatedAt"]);
          const query = req.query as unknown as GridFilterStateType;
          const isSelectAllRows = (query.isSelectAllRows as unknown as string === "true");
          const qbWithFilters = srBuildFilterCriteria(qb, query);
          const data = await qbWithFilters;
          const total = data.length ? await utCountTotalByQb(qbWithFilters) : 0;
          res.sendList({
            list: data,
            total,
            allIds: isSelectAllRows ? await utGetAllDataIdsArray(trx, qb, "rRoleId") : [],
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

  static async deleteRole(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { rId } = req.params;
      await knex.transaction(async (trx) => {
        await SrRole.deleteByRole(trx, rId);
        res.sendMsg(MESSAGE_ROLE_DELETED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async deleteRoles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        await SrRole.deleteRoles(trx, req.body);
        res.sendMsg(MESSAGE_ROLE_DELETED);
      });
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
      const { documentType } = req.params;
      if (documentType) {
        await knex.transaction(async (trx) => {
          const qb = DoRole.getAll(trx, ["rRoleId", "rRoleName", "rRoleCreatedAt"]);
          const { exports, ...filters } = req.query as unknown as GridFilterStateType;

          const data = await srBuildFilterCriteria(qb, filters);
          const colsToExport = utGetExportableColumns(exports);
          const session = utGetUserSession(req);
          const getDateFormat = await SrUserPreferences.getUserPreferenceByType(trx, session.uEntityId, "dateDisplayFormat");
          const dateFormat = getDateFormat?.upValue as string || cfgApp.appUniversalMomentDateFormat;
          const bufferData = await SrGenerateDocument
            .generateDocumentByType(data, documentType, colsToExport,
              {
                heading: exports?.title || "Roles List", dateDisplayFormat: dateFormat,
              });
          SrGenerateDocument.setAttachmentType(res, exports?.filename || "roles-list", documentType);
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

export default CtRole;
