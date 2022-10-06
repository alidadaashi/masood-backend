import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../base/dao/doBase";
import MdProduct from "./mdProduct";
import I18nDynamicDao from "../i18n/i18nDynamic/doI18nDynamic";
import { TProduct } from "./tpProduct";
import { getSlug } from "../../../i18n";

class DoProduct extends DoBase<MdProduct> {
  constructor() {
    super(MdProduct.TABLE_NAME);
  }

  getAllProducts(
    trx: Transaction,
    selectedInstanceId: string,
    langId: string,
  ): QueryBuilder<TProduct[]> {
    const productQb = trx(this.tableName)
      .select([
        trx.raw("?? as ??", [MdProduct.col("pId"), "productId"]),
        trx.raw("?? as ??", [MdProduct.col("pPrice"), "price"]),
      ]).where(this.col("pInstanceId"), selectedInstanceId);

    const defaults = {
      langId, selectedInstanceId, itemType: "product", itemPkKey: MdProduct.col("pId"),
    };
    const titleSelectionQb = trx.raw(`(${I18nDynamicDao.getDynamicItemTranslation(
      trx, getSlug("frm__lbl__product_fruits_title"), defaults,
    )}) as title`);

    const descriptionSelectionQb = trx.raw(`(${I18nDynamicDao.getDynamicItemTranslation(
      trx, getSlug("frm__lbl__product_fruits_description"), defaults,
    )}) as description`);

    productQb.select([
      titleSelectionQb,
      descriptionSelectionQb,
    ]);

    return productQb;
  }
}

export default new DoProduct();
