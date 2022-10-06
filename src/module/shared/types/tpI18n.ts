import MdI18nTranslations from "../../i18n/i18nTranslations/mdI18nTranslations";
import MdI18nDynamic from "../../i18n/i18nDynamic/mdI18nDynamic";
import MdPages from "../../pages/mdPages";
import MdModule from "../../privilege/module/mdModule";

export type TI18nUpdateTranslationData = {
  slugId: string,
  translationId: string,
  translationValue?: string,
  language: string,
  transRowType: MdI18nTranslations["itType"],
  transRowOvdType: MdI18nTranslations["itOverrideType"],

  dynamicItemType: MdI18nDynamic["idItemType"],
  dynamicItemId: string,
  i18nRouteName?: string,
  instanceId?: string,
}

export type tpI18nUpdateTransformData = Pick<TI18nUpdateTranslationData, "slugId" | "translationId"
  | "translationValue" | "language" | "transRowType" | "transRowOvdType" | "i18nRouteName">

export type tpI18nUpdateTransformDataWithMultipleImp = tpI18nUpdateTransformData
  & Pick<MdModule, "mModuleName"> & Pick<MdPages, "pgName">

export type TI18nUpdateTranslationMultipleImp = TI18nUpdateTranslationData & {
  mModuleName: string,
  pgName: string,
}

export type TI18nGetTranslationQueryParam = {
  module: string,
  page: string
}

export type TI18nTransScreenText = {
  [key: string]: {
    [key: string]: {
      [key: string]: string
    }
  }
};

export type TI18nUpdateMultiInstTranslationData = {
  slugId: string,
  translationId: string,
  translationValue?: string,
  language: string,
  transRowType: MdI18nTranslations["itType"],
  transRowOvdType: MdI18nTranslations["itOverrideType"],

  dynamicItemType?: MdI18nDynamic["idItemType"],
  dynamicItemId?: string,
  i18nRouteName?: string,
  instanceId: string,
  mModuleName?: string,
  pgName?: string,
}

export type TI18nMultiInstUpdateTranslationMultipleImp = TI18nUpdateMultiInstTranslationData & {
  mModuleName: string,
  pgName: string,
}

export type tpI18nUpdateMultiInstTransformData = Pick<TI18nUpdateMultiInstTranslationData, "slugId" | "translationId"
  | "translationValue" | "language" | "transRowType" | "transRowOvdType" | "i18nRouteName" | "instanceId">

export type tpI18nUpdateMultiInstTransformDataWithMultipleImp = tpI18nUpdateMultiInstTransformData
  & Pick<MdModule, "mModuleName"> & Pick<MdPages, "pgName">
