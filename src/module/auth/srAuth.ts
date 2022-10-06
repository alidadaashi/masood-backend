import { Transaction } from "knex";
import moment from "moment";
import doEntity from "../entity/doEntity";
import SrBcrypt from "../shared/services/srBcrypt";
import MdCredential from "../user/credentials/mdCredential";

export const srCheckCredentials = async (
  credentials: MdCredential,
  password: string,
  trx: Transaction,
): Promise<boolean> => credentials
  && (await SrBcrypt.bcryptCompare(password, credentials.cPassword))
  && (await doEntity.findOneByCol(trx, "entityId", credentials.cUserEntityId))
    ?.entityStatus === "active";

export const srCheckIsTokenExpire = (
  token: string,
): boolean => moment(token).isAfter(moment());
