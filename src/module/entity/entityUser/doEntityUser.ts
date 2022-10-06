import { QueryBuilder } from "knex";
import MdEntityUser from "./mdEntityUser";
import DoBase from "../../../base/dao/doBase";
import MdUser from "../../user/mdUser";
import MdCredential from "../../user/credentials/mdCredential";

class DoEntityUser extends DoBase<MdEntityUser> {
  constructor() {
    super(MdEntityUser.TABLE_NAME);
  }

  getAllEntityUsersByQb(
    qb: QueryBuilder,
    entityId: string,
  ): QueryBuilder<(MdUser & MdCredential)[]> {
    return qb
      .where(this.col("euEntityId"), entityId);
  }
}

export default new DoEntityUser();
