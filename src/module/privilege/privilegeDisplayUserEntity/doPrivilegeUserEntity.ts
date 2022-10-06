import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdPrivilegeUserEntity from "./mdPrivilegeUserEntity";
import { EntityTypes, tpGetType } from "../../shared/types/tpShared";
import MdDomainDetails from "../../entities/domain/mdDomainDetails";
import MdGroupDetails from "../../entities/group/mdGroupDetails";

class DoPrivilegeUserEntity extends DoBase<MdPrivilegeUserEntity> {
  constructor() {
    super(MdPrivilegeUserEntity.TABLE_NAME);
  }

  getUserAllPrivilegesDomains(trx: Transaction, userEntityId: string): QueryBuilder<MdGroupDetails[]> {
    return trx(this.tableName)
      .select([
        MdDomainDetails.col("dId"),
        MdDomainDetails.col("dName"),
        MdDomainDetails.col("dEntityId"),
      ])
      .join(MdDomainDetails.TABLE_NAME, this.col("pueEntityId"), MdDomainDetails.col("dEntityId"))
      .where(this.col("pueUserEntityId"), userEntityId)
      .andWhere(this.col("pueEntityType"), tpGetType<EntityTypes>("domain"));
  }

  getUserAllPrivilegesGroups(trx: Transaction, userEntityId: string): QueryBuilder<MdGroupDetails[]> {
    return trx(this.tableName)
      .select([
        MdGroupDetails.col("gId"),
        MdGroupDetails.col("gName"),
        MdGroupDetails.col("gEntityId"),
      ])
      .join(MdGroupDetails.TABLE_NAME, this.col("pueEntityId"), MdGroupDetails.col("gEntityId"))
      .where(this.col("pueUserEntityId"), userEntityId)
      .andWhere(this.col("pueEntityType"), tpGetType<EntityTypes>("group"));
  }

  deleteGroupPrivileges(trx: Transaction, groupEntityIds: string[]) {
    return trx(this.tableName)
      .del()
      .whereIn(this.col("pueEntityId"), groupEntityIds);
  }
}

export default new DoPrivilegeUserEntity();
