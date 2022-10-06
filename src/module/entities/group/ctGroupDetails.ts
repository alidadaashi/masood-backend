import { NextFunction, Request, Response } from "express";
import knex from "../../../base/database/cfgKnex";
import SrGroupDetails from "./srGroupDetails";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { utCountTotalByQb, utGetExportableColumns } from "../../shared/utils/utData";
import { DocumentTypeType, GroupRequestBodyType } from "../../shared/types/tpShared";
import MdDomainDetails from "../domain/mdDomainDetails";
import {
  ERR_DOCUMENT_TYPE_REQUIRED, ERR_GROUP_DETAILS_NOT_EXISTS, MESSAGE_GROUP_CREATED,
  MESSAGE_GROUP_DELETED, MESSAGE_GROUP_UPDATED, MESSAGE_PERMISSION_DENIED,
} from "../../shared/constants/dtOtherConstants";
import SrGenerateDocument from "../../shared/services/srGenerateDocument";
import DoCreatorEntity from "../creatorEntity/doCreatorEntity";
import DoGroup from "./doGroupDetails";
import DoDomain from "../domain/doDomainDetails";
import { utGetUserSession } from "../../shared/utils/utOther";
import SrAclGuardGroup from "../../../routes/srAclGuardGroup";
import { srBuildFilterCriteria } from "../../shared/services/filters/srFilter";
import { GridFilterStateType } from "../../shared/types/tpFilter";
import SrUserPreferences from "../../preferences/userPreference/srUserPreferences";
import cfgApp from "../../../base/configs/cfgApp";
import { utGetAllDataIdsArray } from "../../shared/utils/utFilter";

class CtGroupDetails {
  static async addGroup(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      const reqData = req.body as GroupRequestBodyType;
      await knex.transaction(async (trx) => {
        if (SrAclGuardGroup.canCreateGroup(reqData.domain.dEntityId, session)) {
          const data = await SrGroupDetails.addGroup(trx, reqData);
          await DoCreatorEntity.insertOne(trx, {
            ceCreatorId: session.uEntityId,
            ceEntityId: data.gEntityId,
            ceEntityType: "group",
          });
          res.sendObject(data, MESSAGE_GROUP_CREATED);
        } else {
          throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllGroups(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const qb = SrAclGuardGroup.getGroupListViewQb(trx, session.uEntityId, session);
        if (qb) {
          const query = (req.query as unknown) as GridFilterStateType;
          const { getDataForSelectedRows } = req.body;
          const isSelectAllRows = (query.isSelectAllRows as unknown as string === "true");
          const qbWithFilters = srBuildFilterCriteria(SrGroupDetails.getAllGroupsByQb(qb), {
            ...query,
            getDataForSelectedRows,
          });
          const allIds = isSelectAllRows ? await utGetAllDataIdsArray(trx, qb, "gEntityId") : [];
          const data = await qbWithFilters;
          res.sendList({
            list: data,
            total: data?.length ? await utCountTotalByQb(qbWithFilters) : 0,
            allIds,
          });
        } else {
          res.sendList({ list: [], total: 0, allIds: [] });
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateGroup(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      const reqData = req.body as GroupRequestBodyType;
      const { groupId } = req.params;

      await knex.transaction(async (trx) => {
        const group = await DoGroup.findOneByCol(trx, "gId", groupId);
        if (group && await SrAclGuardGroup.canUpdateGroup(trx, {
          userEntityId: session.uEntityId,
          updatingGroupDomainEntityId: group.gDomainEntityId,
          updatingGroupEntityId: group.gEntityId,
          privs: session,
        })) {
          const data = await SrGroupDetails.updateGroup(trx, groupId, reqData);
          res.sendObject(data, MESSAGE_GROUP_UPDATED);
        } else {
          throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async deleteGroup(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { groupId } = req.params;
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const group = await DoGroup.findOneByCol(trx, "gId", groupId);
        if (group && await SrAclGuardGroup.canDeleteGroup(trx, {
          userEntityId: session.uEntityId,
          deletingGroupDomainEntityId: group.gDomainEntityId,
          deletingGroupEntityId: group.gEntityId,
          privs: session,
        })) {
          await SrGroupDetails.deleteGroup(trx, group.gEntityId);
          res.sendMsg(MESSAGE_GROUP_DELETED);
        } else {
          throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async deleteGroups(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        await SrGroupDetails.deleteGroups(trx, session, req.body);
        res.sendMsg(MESSAGE_GROUP_DELETED);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getGroupDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { groupId } = req.params;
      await knex.transaction(async (trx) => {
        const groupDetails = await SrGroupDetails.getGroupById(trx, groupId);
        if (groupDetails) {
          res.sendObject(groupDetails);
        } else {
          throw new MdUnprocessableEntityError(ERR_GROUP_DETAILS_NOT_EXISTS);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllAssignedDomains(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = utGetUserSession(req);
      await knex.transaction(async (trx) => {
        const qb = SrAclGuardGroup.getAssignedDomainsListViewQb(trx, session);
        if (qb) {
          const data: MdDomainDetails[] = await DoDomain.getAllDomainsByQb(qb);
          res.sendList({
            list: data,
            total: data?.length,
          });
        } else {
          res.sendList({ list: [] });
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
      const session = utGetUserSession(req);
      const { documentType } = req.params;
      if (documentType) {
        const { exports, ...filters } = req.query as unknown as GridFilterStateType;
        await knex.transaction(async (trx) => {
          const qb = SrAclGuardGroup.getGroupListViewQb(trx, session.uEntityId, session);
          const getDateFormat = await SrUserPreferences.getUserPreferenceByType(trx, session.uEntityId, "dateDisplayFormat");
          const dateFormat = getDateFormat?.upValue as string || cfgApp.appUniversalMomentDateFormat;
          if (qb) {
            const data = await srBuildFilterCriteria(SrGroupDetails.getAllGroupsByQb(qb), filters);
            const colsToExport = utGetExportableColumns(exports);
            const bufferData = await SrGenerateDocument
              .generateDocumentByType(data, documentType, colsToExport, {
                heading: exports?.title || "Groups List", dateDisplayFormat: dateFormat,
              });
            SrGenerateDocument.setAttachmentType(res, exports?.filename || "groups-list", documentType);

            res.send(bufferData);
          } else {
            res.end();
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

export default CtGroupDetails;
