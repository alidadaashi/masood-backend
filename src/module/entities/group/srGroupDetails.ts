import { QueryBuilder, Transaction } from "knex";
import DoGroup from "./doGroupDetails";
import MdGroupDetails from "./mdGroupDetails";
import DoEntity from "../../entity/doEntity";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import MdDomainDetails from "../domain/mdDomainDetails";
import SrUser from "../../user/srUser";
import DoEntityUser from "../../entity/entityUser/doEntityUser";
import { GroupRequestBodyType, UserReqType, UserSessionType } from "../../shared/types/tpShared";
import { utSanitizeText } from "../../shared/utils/utString";
import DoUser from "../../user/doUser";
import MdUser from "../../user/mdUser";
import DoPrivilegeDisplayUserEntity from "../../privilege/privilegeDisplayUserEntity/doPrivilegeUserEntity";
import { utUpdateAllUsersPrivilegesIn } from "../../shared/utils/utSession";
import SrEntityUser from "../../entity/entityUser/srEntityUser";
import { ERR_GROUP_NOT_EXISTS, MESSAGE_PERMISSION_DENIED } from "../../shared/constants/dtOtherConstants";
import SrAclGuardGroup from "../../../routes/srAclGuardGroup";

class SrGroupDetails {
  static async addGroup(
    trx: Transaction,
    data: GroupRequestBodyType,
  ): Promise<MdGroupDetails & MdUser> {
    const {
      gName,
      uFirstName,
      uLastName,
      cEmail,
      cPassword,
      domain,
      uId,
    } = data;
    const [{ entityId }] = await DoEntity.insertOne(trx, { entityType: "group" });

    const user = uId
      ? await DoUser.findOneByCol(trx, "uId", uId)
      : await SrUser.addUser(trx, {
        cEmail,
        uFirstName,
        uLastName,
        cPassword,
      } as UserReqType);

    const [group] = await DoGroup.insertOne(trx, {
      gEntityId: entityId,
      gDomainEntityId: domain.dEntityId,
      gName,
    });

    await DoEntityUser.insertOne(trx, {
      euEntityId: group.gEntityId,
      euUserEntityId: user.uEntityId,
    });

    return { ...group, ...user };
  }

  static async getAllGroups(trx: Transaction): Promise<MdGroupDetails[]> {
    return DoGroup.getAllGroups(trx);
  }

  static getAllGroupsByQb(qb: QueryBuilder, domains?: string[]): QueryBuilder<MdGroupDetails[]> {
    return DoGroup.getAllGroupsByQb(qb, domains);
  }

  static async updateGroup(
    trx: Transaction,
    groupId: string,
    data: GroupRequestBodyType,
  ): Promise<MdGroupDetails> {
    const {
      gName,
      domain,
      uId,
      uFirstName,
      uLastName,
      cEmail,
      cPassword,
    } = data;

    const group = await DoGroup.findOneByCol(trx, "gId", groupId);
    if (group && domain) {
      const [updatedGroup] = await DoGroup.updateOneByColName(trx, {
        gName: utSanitizeText(gName),
        gDomainEntityId: domain.dEntityId,
      }, "gId", groupId);

      let user = null;
      if (!data.inEdit) {
        user = uId
          ? await SrEntityUser.changeEntityUser(trx, updatedGroup.gEntityId, uId)
          : await SrEntityUser.addEntityUser(trx, updatedGroup.gEntityId, {
            uFirstName,
            uLastName,
            cEmail,
            cPassword,
          });
      }

      return { ...updatedGroup, ...(user || {}) };
    }
    throw new MdUnprocessableEntityError(ERR_GROUP_NOT_EXISTS);
  }

  static async deleteGroup(
    trx: Transaction,
    groupEntityId: string,
  ): Promise<void> {
    await DoEntity.updateOneByColName(trx, { entityStatus: "disabled" }, "entityId", groupEntityId);

    const groupUserEntityIds = await DoPrivilegeDisplayUserEntity.findAllByPredicatePickField(
      trx, {
        pueEntityId: groupEntityId,
        pueEntityType: "group",
      }, "pueUserEntityId",
    );

    if (groupUserEntityIds?.length) {
      await DoPrivilegeDisplayUserEntity.deleteManyByCol(trx, "pueEntityId", groupEntityId);
      await utUpdateAllUsersPrivilegesIn(trx, groupUserEntityIds);
    }
  }

  static async deleteGroups(
    trx: Transaction,
    session: UserSessionType,
    deleteIds: string[],
  ): Promise<void> {
    const bulkGroupDelete = deleteIds.map(async (id) => {
      const group = await DoGroup.findOneByCol(trx, "gId", id);
      if (group && await SrAclGuardGroup.canDeleteGroup(trx, {
        userEntityId: session.uEntityId,
        deletingGroupDomainEntityId: group.gDomainEntityId,
        deletingGroupEntityId: group.gEntityId,
        privs: session,
      })) {
        await SrGroupDetails.deleteGroup(trx, group.gEntityId);
      } else {
        throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
      }
    });
    await Promise.all(bulkGroupDelete);
  }

  static async getGroupById(
    trx: Transaction,
    groupId: string,
  ): Promise<MdDomainDetails> {
    return DoGroup.getGroupDetails(trx, groupId);
  }
}

export default SrGroupDetails;
