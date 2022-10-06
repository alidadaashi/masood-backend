import { Transaction } from "knex";
import MdGroupDetails from "../../../module/entities/group/mdGroupDetails";
import DoGroupDetails from "../../../module/entities/group/doGroupDetails";
import DoSuppliers from "./doSuppliers";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { srBuildFilterCriteria } from "../../../module/shared/services/filters/srFilter";
import { utCountTotalByQb } from "../../../module/shared/utils/utData";
import { GridFilterStateType } from "../../../module/shared/types/tpFilter";

class SrSuppliers {
  static async getAllSuppliersForVendor(
    trx: Transaction,
    vendorId: string,
    filters: GridFilterStateType,
  ):Promise<{ list: MdGroupDetails[], total: number }> {
    const vendor = await DoGroupDetails.findOneByCol(trx, "refSpId", vendorId);
    if (vendor) {
      const qb = DoSuppliers.getAllSuppliersForVendor(trx, vendor.gEntityId);
      const qbWithFilters = srBuildFilterCriteria(qb, filters);

      const data = await qbWithFilters;
      const total = data.length ? await utCountTotalByQb(qbWithFilters) : 0;
      return { list: data, total };
    }
    throw new MdUnprocessableEntityError("The vendor does not exists");
  }
}

export default SrSuppliers;
