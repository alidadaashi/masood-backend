import { NextFunction, Request, Response } from "express";
import { QueryBuilder, Transaction } from "knex";
import knex from "../../base/database/cfgKnex";
import SrUser, { srGetQbForDomainOrGroupEntity } from "./srUser";
import { utCountTotalByQb, utGetExportableColumns } from "../shared/utils/utData";
import {
  DocumentTypeType, EntityTypes, UserSessionType,
} from "../shared/types/tpShared";
import MdUnprocessableEntityError from "../../base/errors/mdUnprocessableEntityError";
import SrGenerateDocument from "../shared/services/srGenerateDocument";
import DoUser from "./doUser";
import {
  ERR_DOCUMENT_TYPE_REQUIRED, ERR_USER_NOT_EXISTS, MESSAGE_PERMISSION_DENIED,
  MESSAGE_USER_CREATED, MESSAGE_USER_DELETED, MESSAGE_USER_UPDATED,
} from "../shared/constants/dtOtherConstants";
import { utIsItgAdmin } from "../shared/utils/utAuth";
import { utGetUserSession } from "../shared/utils/utOther";
import DoEntityUser from "../entity/entityUser/doEntityUser";
import SrAclGuardDomainUser from "../../routes/srAclGuardDomainUser";
import SrAclGuardGroupUser from "../../routes/srAclGuardGroupUser";
import { srBuildFilterCriteria } from "../shared/services/filters/srFilter";
import { GridFilterStateType } from "../shared/types/tpFilter";
import SrSession from "../shared/services/srSession";
import { ctGetUserSessionData } from "../auth/ctAuth";
import SrUserPreferences from "../preferences/userPreference/srUserPreferences";
import cfgApp from "../../base/configs/cfgApp";
import { utGetAllDataIdsArray } from "../shared/utils/utFilter";

const srDomainAndGroupUsersUnionQb = (
  trx: Transaction, qbDomainUsers: QueryBuilder, qbGroupUsers: QueryBuilder, query: GridFilterStateType,
) => {
  const qbs = trx.union([qbDomainUsers, qbGroupUsers], true);
  const wrappedQbInSubQueryForFilters = knex.select("*").from(qbs.as("SUBQ"));
  return { getAllQb: qbs, filteredQb: srBuildFilterCriteria(wrappedQbInSubQueryForFilters, query, undefined, false) };
};

const srGetDomainAndOrGroupQb = (
  trx: Transaction, session: UserSessionType, query: GridFilterStateType,
): {
  getAllQb: QueryBuilder | null,
  filteredQb: QueryBuilder | null
} => {
  const qbDomainUsers = SrAclGuardDomainUser.getDomainUserListViewQb(trx, session.uEntityId, session);
  const qbGroupUsers = SrAclGuardGroupUser.srGetGroupUserListViewQb(trx, session.uEntityId, session);

  const allQb = qbDomainUsers || qbGroupUsers;
  let allQbWithFilters = qbDomainUsers || qbGroupUsers;

  if (allQb) {
    if (qbDomainUsers && qbGroupUsers) {
      const { getAllQb, filteredQb } = srDomainAndGroupUsersUnionQb(trx, qbDomainUsers, qbGroupUsers, query);
      return { getAllQb, filteredQb };
    }
    allQbWithFilters = srBuildFilterCriteria(allQb, query);
  }

  return { getAllQb: allQb, filteredQb: allQbWithFilters };
};
class CtUser {
  static async addUser(
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const { entityId } = req.params;
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        if (
          await SrAclGuardDomainUser.canCreateDomainUser(trx, session.uEntityId, entityId, session)
          || await SrAclGuardGroupUser.srCanCreateGroupUser(trx, session.uEntityId, entityId, session)
        ) {
          const data = await SrUser.addUser(trx, utIsItgAdmin(session)
            ? req.body : {
              ...req.body,
              euEntityId: entityId,
            });
          res.sendObject(data, MESSAGE_USER_CREATED);
        } else {
          throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllUsers(
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      const query = req.query as unknown as GridFilterStateType;
      const isHaveGrouping = (query.isHaveGrouping as unknown as string === "true");
      const isSelectAllRows = (query.isSelectAllRows as unknown as string === "true");
      await knex.transaction(async (trx) => {
        const { getAllQb, filteredQb } = srGetDomainAndOrGroupQb(trx, session, query);
        if (getAllQb && filteredQb) {
          const data = isHaveGrouping ? await filteredQb : await DoUser.getAllUsersByQb(filteredQb);
          const allIds = isSelectAllRows ? await utGetAllDataIdsArray(trx, getAllQb, "uId") : [];
          const total = await utCountTotalByQb(filteredQb);
          res.sendList({ list: data, total, allIds });
        } else {
          res.sendList({ list: [], total: 0, allIds: [] });
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateUser(
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      const { userId } = req.params;
      await knex.transaction(async (trx) => {
        const user = await DoUser.findOneByCol(trx, "uId", userId);
        if (user && (
          await SrAclGuardDomainUser.canUpdateDomainUser(trx, session.uEntityId, user.uEntityId, session)
          || await SrAclGuardGroupUser.srCanUpdateGroupUser(trx, session.uEntityId, user.uEntityId, session)
        )) {
          const data = await SrUser.updateUser(trx, userId, req.body);
          res.sendObject(data, MESSAGE_USER_UPDATED);
        } else {
          throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateUserProfile(
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      const userId = session.uId;
      await knex.transaction(async (trx) => {
        const user = await DoUser.findOneByCol(trx, "uId", userId);
        if (user) {
          const data = await SrUser.updateUserProfile(trx, userId, req.body);
          const userData = await DoUser.findOneByCol(trx, "uEntityId", user.uEntityId);
          const sessionData = await ctGetUserSessionData(trx, req.session.id, userData);
          SrSession.saveSession(req,
            {
              ...sessionData, uFirstName: data.uFirstName, uLastName: data.uLastName,
            } as UserSessionType);
          res.sendObject(data, MESSAGE_USER_UPDATED);
        } else {
          throw new MdUnprocessableEntityError(ERR_USER_NOT_EXISTS);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async deleteUser(
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const user = await DoUser.findOneByCol(trx, "uId", userId);
        if (user && (
          await SrAclGuardDomainUser.canDeleteDomainUser(trx, session.uEntityId, user.uEntityId, session)
          || await SrAclGuardGroupUser.srCanDeleteGroupUser(trx, session.uEntityId, user.uEntityId, session)
        )) {
          await SrUser.deleteUser(trx, userId);
          res.sendMsg(MESSAGE_USER_DELETED);
        } else {
          throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async deleteUsers(
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        await SrUser.deleteUsers(trx, session, req.body);
        res.sendMsg(MESSAGE_USER_DELETED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllEntityUsers(
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const {
        entityId,
        entityType,
      } = req.params as { entityId: string, entityType: string };
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const qb = srGetQbForDomainOrGroupEntity(trx, entityType, session);
        const query = req.query as unknown as GridFilterStateType;
        const isSelectAllRows = (query.isSelectAllRows as unknown as string === "true");
        if (qb) {
          const qb1 = DoEntityUser.getAllEntityUsersByQb(qb, entityId);
          const qb1WithFilters = srBuildFilterCriteria(qb1, query);
          res.sendList({
            list: await qb1WithFilters,
            total: await utCountTotalByQb(qb1WithFilters),
            allIds: isSelectAllRows ? await utGetAllDataIdsArray(trx, qb1, "uId") : [],
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

  static async generateDocumentForEntityUser(
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const {
        documentType, entityId, entityType,
      } = req.params as { documentType: DocumentTypeType, entityType: EntityTypes, entityId: string };
      if (documentType) {
        const session = utGetUserSession(req);
        await knex.transaction(async (trx) => {
          const qb = srGetQbForDomainOrGroupEntity(trx, entityType, session);
          const getDateFormat = await SrUserPreferences
            .getUserPreferenceByType(trx, session.uEntityId, "dateDisplayFormat");
          const dateFormat = getDateFormat?.upValue as string || cfgApp.appUniversalMomentDateFormat;
          const ctExportsCb = async () => {
            if (qb) {
              const { exports, ...filters } = req.query as unknown as GridFilterStateType;
              const data = await srBuildFilterCriteria(DoEntityUser.getAllEntityUsersByQb(qb, entityId), filters);
              const colsToExport = utGetExportableColumns(exports);
              const bufferData = await SrGenerateDocument
                .generateDocumentByType(data, documentType, colsToExport,
                  { heading: exports?.title || "Users List", dateDisplayFormat: dateFormat });
              SrGenerateDocument.setAttachmentType(res, exports?.filename || "users-list", documentType);
              res.send(bufferData);
            } else res.end("There is nothing to download");
          };
          await ctExportsCb();
        });
      } else throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_REQUIRED);
    } catch (e) {
      next(e);
    }
  }

  static async getUserInstances(
    req: Request, res: Response, next: NextFunction,
  ): Promise<void> {
    const session = utGetUserSession(req);
    try {
      await knex.transaction(async (trx) => {
        const isItgAdmin = utIsItgAdmin(session);
        const userInstances = await SrUser.getUserInstances(trx, session.uEntityId, isItgAdmin);
        res.sendList({ list: userInstances, total: 0 });
      });
    } catch (e) {
      next(e);
    }
  }

  static async generateDocument(
    req: Request<{ documentType: DocumentTypeType }>, res: Response, next: NextFunction,
  ): Promise<void> {
    try {
      const { documentType } = req.params;
      if (documentType) {
        const { exports, ...filters } = req.query as unknown as GridFilterStateType;
        const session = utGetUserSession(req);
        await knex.transaction(async (trx) => {
          const { filteredQb } = srGetDomainAndOrGroupQb(trx, session, filters);
          const getDateFormat = await SrUserPreferences.getUserPreferenceByType(trx, session.uEntityId, "dateDisplayFormat");
          const dateFormat = getDateFormat?.upValue as string || cfgApp.appUniversalMomentDateFormat;
          if (filteredQb) {
            const colsToExport = utGetExportableColumns(exports);
            const bufferData = await SrGenerateDocument
              .generateDocumentByType(await filteredQb, documentType, colsToExport,
                { heading: exports?.title || "Users List", dateDisplayFormat: dateFormat });
            SrGenerateDocument.setAttachmentType(res, exports?.filename || "users-list", documentType);
            res.send(bufferData);
          } else {
            res.end("There is nothing to download");
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

export default CtUser;
