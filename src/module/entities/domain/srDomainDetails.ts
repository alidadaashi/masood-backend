import { QueryBuilder, Transaction } from "knex";
import DoDomain from "./doDomainDetails";
import MdDomainDetails from "./mdDomainDetails";
import DoEntity from "../../entity/doEntity";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import MdUser from "../../user/mdUser";
import MdCredential from "../../user/credentials/mdCredential";
import SrUser from "../../user/srUser";
import DoEntityUser from "../../entity/entityUser/doEntityUser";
import { UserReqType, UserSessionType } from "../../shared/types/tpShared";
import DoUser from "../../user/doUser";
import DoPrivilegeDisplayUserEntity from "../../privilege/privilegeDisplayUserEntity/doPrivilegeUserEntity";
import { utUpdateAllUsersPrivilegesIn } from "../../shared/utils/utSession";
import DoGroup from "../group/doGroupDetails";
import SrEntityUser from "../../entity/entityUser/srEntityUser";
import { ERR_DOMAIN_NOT_EXISTS, MESSAGE_PERMISSION_DENIED } from "../../shared/constants/dtOtherConstants";
import SrAclGuardDomain from "../../../routes/srAclGuardDomain";

class SrDomainDetails {
  static async addDomain(
    trx: Transaction,
    data: MdDomainDetails & UserReqType,
  ): Promise<MdDomainDetails & MdUser> {
    const {
      dName,
      uFirstName,
      uLastName,
      cEmail,
      cPassword,
      euEntityId,
      uId,
    } = data;

    const [{ entityId }] = await DoEntity.insertOne(trx, { entityType: "domain" });

    const user = uId
      ? await DoUser.findOneByCol(trx, "uId", uId)
      : await SrUser.addUser(trx, {
        euEntityId,
        cEmail,
        uFirstName,
        uLastName,
        cPassword,
      } as UserReqType);

    const [domain] = await DoDomain.insertOne(trx, {
      dEntityId: entityId,
      dName,
    });

    await DoEntityUser.insertOne(trx, {
      euEntityId: domain.dEntityId,
      euUserEntityId: user.uEntityId,
    });

    return { ...domain, ...user };
  }

  static getAllDomainsByQb(qb: QueryBuilder): QueryBuilder<MdDomainDetails[]> {
    return DoDomain.getAllDomainsByQb(qb);
  }

  static async updateDomain(
    trx: Transaction,
    domainId: string,
    data: MdDomainDetails & MdUser & MdCredential & { user: MdUser, inEdit?: boolean },
  ): Promise<MdDomainDetails> {
    const {
      uId,
      dName,
      uFirstName,
      uLastName,
      cEmail,
      cPassword,
    } = data;

    const domain = await DoDomain.findOneByCol(trx, "dId", domainId);
    if (domain) {
      const [updatedDomain] = await DoDomain.updateOneByColName(trx, { dName }, "dId", domainId);

      let user = null;
      if (!data.inEdit) {
        user = uId
          ? await SrEntityUser.changeEntityUser(trx, updatedDomain.dEntityId, uId)
          : await SrEntityUser.addEntityUser(trx, updatedDomain.dEntityId, {
            uFirstName,
            uLastName,
            cEmail,
            cPassword,
          });
      }

      return { ...updatedDomain, ...(user || {}) };
    }
    throw new MdUnprocessableEntityError(ERR_DOMAIN_NOT_EXISTS);
  }

  static async deleteDomain(
    trx: Transaction,
    domainEntityId: string,
  ): Promise<void> {
    await DoEntity.disableDomainAndChildren(trx, domainEntityId);

    const domainUserEntityIds = await DoPrivilegeDisplayUserEntity.findAllByPredicatePickField(
      trx, {
        pueEntityId: domainEntityId,
        pueEntityType: "domain",
      }, "pueUserEntityId",
    );

    const domainGroupsEntityIds = await DoGroup.findAllByPredicatePickField(trx, {
      gDomainEntityId: domainEntityId,
    }, "gEntityId");

    const groupUserEntityIds = await DoPrivilegeDisplayUserEntity.findAllWhereColInPick(trx, "pueEntityId",
      domainGroupsEntityIds, "pueUserEntityId");

    const userEntityIds = [...(domainUserEntityIds || []), ...(groupUserEntityIds || [])];
    if (userEntityIds?.length) {
      await DoPrivilegeDisplayUserEntity.deleteManyByCol(trx, "pueEntityId", domainEntityId);
      await DoPrivilegeDisplayUserEntity.deleteGroupPrivileges(trx, domainGroupsEntityIds);
      await utUpdateAllUsersPrivilegesIn(trx, domainUserEntityIds);
    }
  }

  static async deleteDomains(
    trx: Transaction,
    session: UserSessionType,
    deleteIds: string[],
  ): Promise<void> {
    const deleteDomains = deleteIds.map(async (id): Promise<void> => {
      const domain = await DoDomain.findOneByCol(trx, "dId", id);
      const canDomainDelete = await SrAclGuardDomain.canDeleteDomain(trx, session.uEntityId, domain.dEntityId, session);
      if (canDomainDelete) await this.deleteDomain(trx, domain.dEntityId);
      else throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
    });
    await Promise.all(deleteDomains);
  }

  static async getDomainById(
    trx: Transaction,
    domainId: string,
  ): Promise<MdDomainDetails> {
    return DoDomain.getDomainDetails(trx, domainId);
  }
}

export default SrDomainDetails;
