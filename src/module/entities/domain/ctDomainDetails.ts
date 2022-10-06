import { NextFunction, Request, Response } from "express";
import knex from "../../../base/database/cfgKnex";
import SrDomainDetails from "./srDomainDetails";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { utCountTotalByQb, utGetExportableColumns } from "../../shared/utils/utData";
import {
  DocumentTypeType,
  UserReqType,
} from "../../shared/types/tpShared";
import MdDomainDetails from "./mdDomainDetails";
import {
  ERR_DOCUMENT_TYPE_REQUIRED, ERR_DOMAIN_DETAILS_NOT_EXISTS, MESSAGE_DOMAIN_CREATED, MESSAGE_DOMAIN_DELETED,
  MESSAGE_DOMAIN_UPDATED, MESSAGE_INVALID_DATA, MESSAGE_PERMISSION_DENIED,
} from "../../shared/constants/dtOtherConstants";
import SrGenerateDocument from "../../shared/services/srGenerateDocument";
import DoCreatorEntity from "../creatorEntity/doCreatorEntity";
import DoDomain from "./doDomainDetails";
import { utGetUserSession } from "../../shared/utils/utOther";
import SrAclGuardDomain from "../../../routes/srAclGuardDomain";
import { srBuildFilterCriteria } from "../../shared/services/filters/srFilter";
import { GridFilterStateType } from "../../shared/types/tpFilter";
import SrUserPreferences from "../../preferences/userPreference/srUserPreferences";
import cfgApp from "../../../base/configs/cfgApp";
import { utGetAllDataIdsArray } from "../../shared/utils/utFilter";

class CtDomainDetails {
  static async addDomain(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const reqData = req.body as (MdDomainDetails & UserReqType);
      const session = utGetUserSession(req);
      if (reqData) {
        await knex.transaction(async (trx) => {
          if (SrAclGuardDomain.canCreateDomain(session.uEntityId, session)) {
            const data = await SrDomainDetails.addDomain(trx, reqData);
            await DoCreatorEntity.insertOne(trx, {
              ceCreatorId: session.uEntityId,
              ceEntityId: data.dEntityId,
              ceEntityType: "domain",
            });
            res.sendObject(data, MESSAGE_DOMAIN_CREATED);
          } else {
            throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
          }
        });
      } else {
        throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
      }
    } catch (e) {
      next(e);
    }
  }

  static async getAllDomains(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const qb = SrAclGuardDomain.getDomainListViewQb(trx, session.uEntityId, session);
        if (qb) {
          const query = req.query as unknown as GridFilterStateType;
          const isSelectAllRows = (query.isSelectAllRows as unknown as string === "true");
          const qbWithFilters = srBuildFilterCriteria(SrDomainDetails.getAllDomainsByQb(qb), query);
          const data = await qbWithFilters;
          const total = data?.length ? await utCountTotalByQb(qbWithFilters) : 0;
          res.sendList({
            list: data,
            total,
            allIds: isSelectAllRows ? await utGetAllDataIdsArray(trx, qb, "dId") : [],
          });
        } else {
          res.sendList({
            list: [],
            total: 0,
            allIds: [],
          });
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async getDomainDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { domainId } = req.params;
      await knex.transaction(async (trx) => {
        const domainDetails = await SrDomainDetails.getDomainById(trx, domainId);
        if (domainDetails) {
          res.sendObject(domainDetails);
        } else {
          throw new MdUnprocessableEntityError(ERR_DOMAIN_DETAILS_NOT_EXISTS);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateDomain(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const reqData = req.body;
      const session = utGetUserSession(req);
      const { domainId } = req.params;
      if (reqData && session.privileges && domainId) {
        await knex.transaction(async (trx) => {
          const domain = await DoDomain.findOneByCol(trx, "dId", domainId);
          const canDomainUpdate = SrAclGuardDomain.canUpdateDomain(trx, session.uEntityId, domain.dEntityId, session);
          if (domain && await canDomainUpdate) {
            const data = await SrDomainDetails.updateDomain(trx, domainId, req.body);
            res.sendObject(data, MESSAGE_DOMAIN_UPDATED);
          } else {
            throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
          }
        });
      } else {
        throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
      }
    } catch (e) {
      next(e);
    }
  }

  static async deleteDomain(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      const { domainId } = req.params;
      await knex.transaction(async (trx) => {
        const domain = await DoDomain.findOneByCol(trx, "dId", domainId);
        const canDomainDelete = await SrAclGuardDomain.canDeleteDomain(trx, session.uEntityId, domain.dEntityId, session);
        if (canDomainDelete) {
          await SrDomainDetails.deleteDomain(trx, domain.dEntityId);
          res.sendMsg(MESSAGE_DOMAIN_DELETED);
        } else {
          throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async deleteDomains(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        await SrDomainDetails.deleteDomains(trx, session, req.body);
        res.sendMsg(MESSAGE_DOMAIN_DELETED);
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
      const session = utGetUserSession(req);
      const { documentType } = req.params;
      if (documentType) {
        const { exports, ...filters } = req.query as unknown as GridFilterStateType;
        await knex.transaction(async (trx) => {
          const qb = SrAclGuardDomain.getDomainListViewQb(trx, session.uEntityId, session);
          const getDateFormat = await SrUserPreferences.getUserPreferenceByType(trx, session.uEntityId, "dateDisplayFormat");
          const dateFormat = getDateFormat?.upValue as string || cfgApp.appUniversalMomentDateFormat;
          if (qb) {
            const data = await srBuildFilterCriteria(SrDomainDetails.getAllDomainsByQb(qb), filters);
            const colsToExport = utGetExportableColumns(exports);
            const bufferData = await SrGenerateDocument
              .generateDocumentByType(data, documentType, colsToExport,
                { heading: exports?.title || "Domains List", dateDisplayFormat: dateFormat });
            SrGenerateDocument.setAttachmentType(res, exports?.filename || "domains-list", documentType);
            res.send(bufferData);
          } else {
            res.end(MESSAGE_PERMISSION_DENIED);
          }
        });
      } else {
        throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_REQUIRED);
      }
    } catch (e) {
      next(e);
    }
  }
}

export default CtDomainDetails;
