import { NextFunction, Request, Response } from "express";
import SrPrivileges from "./srPrivileges";
import knex from "../../base/database/cfgKnex";
import { utCountTotalByQb, utGetExportableColumns } from "../shared/utils/utData";
import { DocumentTypeType } from "../shared/types/tpShared";
import MdUnprocessableEntityError from "../../base/errors/mdUnprocessableEntityError";
import { utStringBooleanToBoolean } from "../shared/utils/utString";
import SrGenerateDocument from "../shared/services/srGenerateDocument";
import { utIsItgAdmin } from "../shared/utils/utAuth";
import { utGetUserSession } from "../shared/utils/utOther";
import { srBuildFilterCriteria } from "../shared/services/filters/srFilter";
import { GridFilterStateType } from "../shared/types/tpFilter";
import { ERR_DOCUMENT_TYPE_REQUIRED, MESSAGE_PRIVILEGE_SAVED_USER } from "../shared/constants/dtOtherConstants";
import SrUserPreferences from "../preferences/userPreference/srUserPreferences";
import cfgApp from "../../base/configs/cfgApp";

const ctGetNonFilterableFields = (isAllDetails: string) => {
  const nonFilterableFields = ["companies", "sites", "operationCenters"];
  const isShowDetailList = utStringBooleanToBoolean(isAllDetails as "true" | "false");

  if (!isShowDetailList) {
    nonFilterableFields.push("poOption", "poOptionType");
  }

  return {
    nonFilterableFields,
    isShowDetailList,
  };
};

class CtPrivileges {
  static async getUserAllPrivileges(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId } = req.params;
      await knex.transaction(async (trx) => {
        const userPermissions = await SrPrivileges.getUserAllPrivileges(trx, userId);
        res.sendObject(userPermissions);
      });
    } catch (e) {
      next(e);
    }
  }

  static async assignProfileAndRoles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        await SrPrivileges.saveAssignedPrivileges(trx, req.body);
        res.sendMsg(MESSAGE_PRIVILEGE_SAVED_USER);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllUsersAllPrivileges(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        if (utIsItgAdmin(session)) {
          const query = req.query as unknown as GridFilterStateType;
          const nonFilterableF = ctGetNonFilterableFields(req.query.isShowDetailList as string);
          const qb = SrPrivileges.getAllUsersAllPrivileges(trx, nonFilterableF.isShowDetailList);
          const qbWithFilters = srBuildFilterCriteria(
            qb, query, (field) => (nonFilterableF.nonFilterableFields.includes(field) ? undefined : field),
          );
          const data = await qbWithFilters;
          res.sendList({
            list: data,
            total: data.length > 0 ? await utCountTotalByQb(qbWithFilters) : 0,
          });
        } else {
          res.sendList({
            list: [],
            total: 0,
          });
        }
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
        const { exports, ...filters } = req.query as unknown as GridFilterStateType;
        await knex.transaction(async (trx) => {
          const nonFilterableF = ctGetNonFilterableFields(req.query.isShowDetailList as string);
          const qb = SrPrivileges.getAllUsersAllPrivileges(trx, nonFilterableF.isShowDetailList);
          const data = await srBuildFilterCriteria(qb, filters,
            (field) => (nonFilterableF.nonFilterableFields.includes(field) ? undefined : field));
          const colsToExport = utGetExportableColumns(exports);
          const session = utGetUserSession(req);
          const getDateFormat = await SrUserPreferences.getUserPreferenceByType(trx, session.uEntityId, "dateDisplayFormat");
          const dateFormat = getDateFormat?.upValue as string || cfgApp.appUniversalMomentDateFormat;
          const bufferData = await SrGenerateDocument
            .generateDocumentByType(data, documentType, colsToExport,
              {
                heading: exports?.title || "Users Privileges List", dateDisplayFormat: dateFormat,
              });
          SrGenerateDocument.setAttachmentType(res, exports?.filename || "users-privileges-list", documentType);
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

export default CtPrivileges;
