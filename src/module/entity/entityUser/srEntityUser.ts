import { Transaction } from "knex";
import MdUser from "../../user/mdUser";
import DoEntityUser from "./doEntityUser";
import DoUser from "../../user/doUser";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import MdCredential from "../../user/credentials/mdCredential";
import SrUser from "../../user/srUser";
import { ERR_USER_NOT_EXISTS } from "../../shared/constants/dtOtherConstants";

class SrEntityUser {
  static async changeEntityUser(
    trx: Transaction,
    dEntityId: string,
    uId: string,
  ): Promise<MdUser | null> {
    let user = null;
    const existingEntityUser = await DoEntityUser.findOneByCol(trx, "euEntityId", dEntityId);
    if (existingEntityUser && existingEntityUser.euUserEntityId !== uId) {
      user = await DoUser.findOneByCol(trx, "uId", uId as string);
      if (!user) throw new MdUnprocessableEntityError(ERR_USER_NOT_EXISTS);
      await DoEntityUser.updateOneByColName(trx, {
        euUserEntityId: user.uEntityId,
      }, "euEntityId", dEntityId);
    }

    return user;
  }

  static async addEntityUser(
    trx: Transaction,
    dEntityId: string,
    data: Pick<MdUser & MdCredential, "uFirstName" | "uLastName" | "cEmail" | "cPassword">,
  ): Promise<MdUser> {
    const userDetails = await SrUser.addUser(trx, data);

    await DoEntityUser.updateOneByColName(trx, {
      euUserEntityId: userDetails.uEntityId,
    }, "euEntityId", dEntityId);

    return {
      uId: userDetails.uId,
      uEntityId: userDetails.uEntityId,
      uFirstName: userDetails.uFirstName,
      uLastName: userDetails.uLastName,
    };
  }
}

export default SrEntityUser;
