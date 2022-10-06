import MdBase from "../../../base/models/mdBase";

class MdVendorSupplier extends MdBase {
  static TABLE_NAME = "vendor_supplier";

  constructor(
    public vsVendorId: string,
    public vsSupplierId: string,
    public vsCreatedAt?: string,
    public vsId?: string,
  ) {
    super();
  }

  static col(k: keyof MdVendorSupplier, prefix = true): string {
    return prefix ? `${MdVendorSupplier.TABLE_NAME}.${k}` : k;
  }
}

export default MdVendorSupplier;
