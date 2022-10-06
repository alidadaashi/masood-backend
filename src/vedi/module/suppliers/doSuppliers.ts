import { QueryBuilder, Transaction } from "knex";
import MdGroupDetails from "../../../module/entities/group/mdGroupDetails";
import MdVendorSupplier from "../vendorSupplier/MdVendorSupplier";
import MdEntity from "../../../module/entity/mdEntity";

class DoSuppliers {
  static getAllSuppliersForVendor(
    trx: Transaction,
    vendorEntityId: string,
  ):QueryBuilder<MdGroupDetails[]> {
    return trx<MdVendorSupplier&MdGroupDetails>(MdVendorSupplier.TABLE_NAME)
      .select(["gId", "gEntityId", "gName", "gCreatedAt", "gUpdatedAt"])
      .join(MdEntity.TABLE_NAME, MdEntity.col("entityId"), MdVendorSupplier.col("vsSupplierId"))
      .join(MdGroupDetails.TABLE_NAME, {
        vsSupplierId: "gEntityId",
      } as Record<keyof MdVendorSupplier, keyof MdGroupDetails>)
      .where<keyof MdVendorSupplier>("vsVendorId", vendorEntityId)
      .andWhere({ entityType: "business-partner" } as MdEntity);
  }
}

export default DoSuppliers;
