import { QueryBuilder, Transaction } from "knex";
import MdUser from "./mdUser";
import MdCredential from "./credentials/mdCredential";
import DoUser from "./doUser";
import DoCredentials from "./credentials/doCredential";
import MdUnprocessableEntityError from "../../base/errors/mdUnprocessableEntityError";
import DoEntity from "../entity/doEntity";
import Bcrypt from "../shared/services/srBcrypt";
import DoEntityUser from "../entity/entityUser/doEntityUser";
import { tpUserInstances, UserReqType, UserSessionType } from "../shared/types/tpShared";
import DoGroupDetails from "../entities/group/doGroupDetails";
import {
  ERR_USER_EMAIL_EXISTS, ERR_USER_EXISTS, ERR_USER_NOT_EXISTS, MESSAGE_PERMISSION_DENIED,
} from "../shared/constants/dtOtherConstants";
import SrAclGuardDomainUser from "../../routes/srAclGuardDomainUser";
import SrAclGuardGroupUser from "../../routes/srAclGuardGroupUser";

export const srGetQbForDomainOrGroupEntity = (
  trx: Transaction,
  entityType: string,
  session: UserSessionType,
):QueryBuilder | null => {
  let qb = null;
  if (entityType === "domain") {
    qb = SrAclGuardDomainUser.getDomainUserListViewQb(trx, session.uEntityId, session);
  } else if (entityType === "group") {
    qb = SrAclGuardGroupUser.srGetGroupUserListViewQb(trx, session.uEntityId, session);
  }
  return qb;
};
class SrUser {
  static async addUser(
    trx: Transaction,
    data: UserReqType,
  ): Promise<MdUser & MdCredential> {
    const {
      cEmail,
      uFirstName,
      uLastName,
      cPassword,
    } = data;

    const isUserExistsAlready = await DoCredentials.findOneByCol(trx, "cEmail", cEmail);
    if (!isUserExistsAlready) {
      const [{ entityId }] = await DoEntity.insertOne(trx, { entityType: "user" });
      const [user] = await DoUser.insertOne(trx, {
        uEntityId: entityId,
        uFirstName,
        uLastName,
      });
      const [credentials] = await DoCredentials.insertOne(trx, {
        cEmail,
        cUserEntityId: user.uEntityId,
        cPassword: await Bcrypt.bcryptHash(cPassword),
      });

      if (data.euEntityId) {
        await DoEntityUser.insertOne(trx, {
          euUserEntityId: user.uEntityId,
          euEntityId: data.euEntityId,
        });
      }

      return { ...user, ...credentials };
    }
    throw new MdUnprocessableEntityError(ERR_USER_EXISTS);
  }

  static getAllUsers(
    trx: Transaction,
  ): QueryBuilder<(MdUser & MdCredential)[]> {
    return DoUser.getAllUsers(trx);
  }

  static async updateUser(
    trx: Transaction,
    userId: string,
    data: Pick<MdUser & MdCredential, | "uFirstName" | "uLastName" | "cEmail" | "cPassword">,
  ): Promise<MdUser & MdCredential> {
    const {
      uFirstName,
      uLastName,
      cEmail,
      cPassword,
    } = data;

    const user = await DoUser.findOneByCol(trx, "uId", userId);
    if (user) {
      if (await DoCredentials.findExistingCredentialsByEmailAndNotEntity(trx, user.uEntityId, cEmail)) {
        throw new MdUnprocessableEntityError(ERR_USER_EMAIL_EXISTS);
      }

      const [updatedUser] = await DoUser.updateOneByColName(trx, {
        uFirstName,
        uLastName,
      }, "uId", userId);

      const [updatedCredentials] = await DoCredentials.updateOneByColName(trx, {
        cEmail,
        ...(cPassword?.length ? { cPassword: await Bcrypt.bcryptHash(cPassword) } : null),
      }, "cUserEntityId", updatedUser.uEntityId);

      return { ...updatedUser, ...updatedCredentials };
    }
    throw new MdUnprocessableEntityError(ERR_USER_NOT_EXISTS);
  }

  static async updateUserProfile(
    trx: Transaction,
    userId: string,
    data: Pick<MdUser, | "uFirstName" | "uLastName">,
  ): Promise<MdUser> {
    const {
      uFirstName,
      uLastName,
    } = data;

    const user = await DoUser.findOneByCol(trx, "uId", userId);
    if (user) {
      const [updatedUser] = await DoUser.updateOneByColName(trx, {
        uFirstName,
        uLastName,
      }, "uId", userId);

      return { ...updatedUser };
    }
    throw new MdUnprocessableEntityError(ERR_USER_NOT_EXISTS);
  }

  static async deleteUser(
    trx: Transaction,
    userId: string,
  ): Promise<void> {
    const user = await DoUser.findOneByCol(trx, "uId", userId);
    if (user) {
      await DoEntity.updateOneByColName(trx, { entityStatus: "disabled" }, "entityId", user.uEntityId);
    } else {
      throw new MdUnprocessableEntityError(ERR_USER_NOT_EXISTS);
    }
  }

  static async deleteUsers(
    trx: Transaction,
    session: UserSessionType,
    userIds: string[],
  ): Promise<void> {
    const bulkUsersDelete = userIds.map(async (userId) => {
      const user = await DoUser.findOneByCol(trx, "uId", userId);
      if (user && (
        await SrAclGuardDomainUser.canDeleteDomainUser(trx, session.uEntityId, user.uEntityId, session)
        || await SrAclGuardGroupUser.srCanDeleteGroupUser(trx, session.uEntityId, user.uEntityId, session)
      )) {
        await this.deleteUser(trx, userId);
      } else {
        throw new MdUnprocessableEntityError(MESSAGE_PERMISSION_DENIED);
      }
    });
    await Promise.all(bulkUsersDelete);
  }

  static async getUserInstances(
    trx: Transaction,
    userEntityId: string,
    isItgAdmin: boolean,
  ): Promise<tpUserInstances[]> {
    if (isItgAdmin) {
      return DoGroupDetails.getAllUserInstancesByInstanceIds(trx);
    }

    const userInstancesIds = await DoEntityUser.findAllByPredicatePickField(trx, {
      euUserEntityId: userEntityId,
    }, "euEntityId");
    return DoGroupDetails
      .getAllUserInstancesByInstanceIds(trx, userInstancesIds);
  }
}

export default SrUser;
