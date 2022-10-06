import MdBase from "../../base/models/mdBase";

class MdProduct extends MdBase {
  static TABLE_NAME = "products";

  constructor(
    public pPrice: number,
    public pInstanceId: string,
    public pId?: string,
    public pCreatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdProduct, prefix = true): string {
    return prefix ? `${MdProduct.TABLE_NAME}.${k}` : k;
  }
}

export default MdProduct;
