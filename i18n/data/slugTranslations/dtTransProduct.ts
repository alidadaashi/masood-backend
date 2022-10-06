import { tpTransType } from "../../types/tpI18n";
import dtSlgProduct from "../slugs/dtSlgProduct";

export const dtTransProduct: tpTransType<typeof dtSlgProduct> = {
  frm__lbl__product_fruits_title: {
    en: "",
    tr: "",
    labelEn: "Products Fruit Title",
    labelTr: "Ürünler Meyve Başlığı",
    transType: "dynamicNormal",
    type: "locked",
  },
  frm__lbl__product_fruits_description: {
    en: "",
    tr: "",
    labelEn: "Products Fruit Description",
    labelTr: "Ürünler Meyve Tanımı",
    transType: "dynamicNormal",
    type: "locked",
  },
};
