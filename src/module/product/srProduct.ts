import { Transaction } from "knex";
import DoProduct from "./doProduct";
import DoI18nTranslations from "../i18n/i18nTranslations/doI18nTranslations";
import DoI18nDynamic from "../i18n/i18nDynamic/doI18nDynamic";
import DoI18n from "../i18n/i18n/doI18n";
import MdUnprocessableEntityError from "../../base/errors/mdUnprocessableEntityError";
import { TProduct, TProductAddRequest } from "./tpProduct";
import DoLanguages from "../i18n/languages/doLanguages";
import { LANGUAGE_EN } from "../shared/data/dtI18nLanguages";
import { srBuildFilterCriteria } from "../shared/services/filters/srFilter";
import { utCountTotalByQb } from "../shared/utils/utData";
import { GridFilterStateType } from "../shared/types/tpFilter";
import { srGetLanguageOrDefault } from "../i18n/languages/utLanguages";
import MdProduct from "./mdProduct";
import MdLanguages from "../i18n/languages/mdLanguages";
import MdI18n from "../i18n/i18n/mdI18n";
import { getSlug } from "../../../i18n";
import { ERR_I18N_KEY_UNAVAILABLE } from "../shared/constants/dtOtherConstants";
import { utGetAllDataIdsArray } from "../shared/utils/utFilter";

const srAddTitle = async (
  trx: Transaction,
  productModel: MdProduct,
  instanceId: string,
  {
    title, titleLangId, defaultLang, i18nTitle,
  }: Partial<TProductAddRequest> & { defaultLang: MdLanguages, i18nTitle: MdI18n },
) => {
  const [translationModel] = await DoI18nTranslations.insertOne(trx, {
    itText: title, itType: "dynamicNormal", itLangId: titleLangId || defaultLang.lId, itI18nId: i18nTitle.iId,
  });
  await DoI18nDynamic.insertOne(trx, {
    idItemId: productModel.pId,
    idItemType: "product",
    idInstanceId: instanceId,
    idTranslationId: translationModel.itId,
  });
};

const srAddDescription = async (
  trx: Transaction,
  productModel: MdProduct,
  instanceId: string,
  {
    description, descriptionLangId, defaultLang, i18nDescription,
  }: Partial<TProductAddRequest> & { defaultLang: MdLanguages, i18nDescription: MdI18n },
) => {
  const [translationModel] = await DoI18nTranslations.insertOne(trx, {
    itText: description,
    itType: "dynamicNormal",
    itLangId: descriptionLangId || defaultLang.lId,
    itI18nId: i18nDescription.iId,
  });
  await DoI18nDynamic.insertOne(trx, {
    idItemId: productModel.pId,
    idItemType: "product",
    idInstanceId: instanceId,
    idTranslationId: translationModel.itId,
  });
};

class SrProduct {
  static async addProduct(
    trx: Transaction,
    selectedInstanceId: string,
    {
      title, titleLangId, description, descriptionLangId, price,
    }: TProductAddRequest,
  ):Promise<void> {
    const i18nTitle = await DoI18n.findOneByCol(trx, "iSlug", getSlug("frm__lbl__product_fruits_title"));
    const i18nDescription = await DoI18n.findOneByCol(trx, "iSlug", getSlug("frm__lbl__product_fruits_description"));

    if (i18nTitle && i18nDescription) {
      const [productModel] = await DoProduct.insertOne(trx, { pPrice: price, pInstanceId: selectedInstanceId });

      const defaultLang = await DoLanguages.findOneByCol(trx, "lShortName", LANGUAGE_EN);

      if (title) {
        await srAddTitle(trx, productModel, selectedInstanceId, {
          title, titleLangId, defaultLang, i18nTitle,
        });
      }
      if (description) {
        await srAddDescription(trx, productModel, selectedInstanceId, {
          description, descriptionLangId, defaultLang, i18nDescription,
        });
      }
    } else {
      throw new MdUnprocessableEntityError(ERR_I18N_KEY_UNAVAILABLE);
    }
  }

  static async getAllProducts(
    trx: Transaction,
    selectedInstanceId: string,
    language: string,
    filters: GridFilterStateType,
  ):Promise<{ data: TProduct[], total: number, allIds: string[] }> {
    const isSelectAllRows = (filters.isSelectAllRows as unknown as string === "true");
    const userPreferenceLanguage = await srGetLanguageOrDefault(trx, language, null);
    const qb = DoProduct.getAllProducts(trx, selectedInstanceId, userPreferenceLanguage.lId as string);
    const allIds = isSelectAllRows ? await utGetAllDataIdsArray(trx, qb, "productId") : [];
    const wrappedQb = trx.from(trx.raw(`(${qb}) as Products`));
    const qbWithFilters = srBuildFilterCriteria(wrappedQb, filters, undefined, false);
    const data:TProduct[] = await qbWithFilters;
    const total = data.length ? await utCountTotalByQb(qbWithFilters) : 0;
    return { data, total, allIds };
  }
}

export default SrProduct;
