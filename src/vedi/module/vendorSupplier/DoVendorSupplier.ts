import DoBase from "../../../base/dao/doBase";
import MdVendorSupplier from "./MdVendorSupplier";

class DoVendorSupplier extends DoBase<MdVendorSupplier> {
  constructor() {
    super(MdVendorSupplier.TABLE_NAME);
  }
}

export default new DoVendorSupplier();
