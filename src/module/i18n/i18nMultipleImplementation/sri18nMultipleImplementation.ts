import { Transaction } from "knex";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { TI18nUpdateTranslationData, tpI18nUpdateTransformData } from "../../shared/types/tpI18n";
import doI18nPageOverride from "../i18nPageOverride/doI18nPageOverride";
import doI18nTranslations from "../i18nTranslations/doI18nTranslations";
import doLanguages from "../languages/doLanguages";

export const utGetMultipleImplementationForUpdate = (
  transformData: tpI18nUpdateTransformData[],
): {
  [key: string]: tpI18nUpdateTransformData[];
} => transformData.reduce(
  (
    acc: {
        [key: string]: tpI18nUpdateTransformData[];
      },
    a,
  ) => {
    acc[a.slugId] = [...(acc[a.slugId] || []), a];
    return acc;
  },
  {},
);

export const srAddTranslationMultipleImp = async (
  trx: Transaction, pageId: string, instanceId: string | null, data: TI18nUpdateTranslationData,
): Promise<void> => {
  const languageModel = await doLanguages.findOneByCol(trx, "lShortName", data.language);
  if (!languageModel) throw new MdUnprocessableEntityError(`The language "${data.language}" does not exists!`);
  const { translationValue, slugId, transRowType } = data;
  const itOverrideType = "stPageOverride";
  const [translationModel] = await doI18nTranslations.insertOne(trx, {
    itText: translationValue, itI18nId: slugId, itLangId: languageModel.lId, itType: transRowType, itOverrideType,
  });

  await doI18nPageOverride.insertOne(trx, {
    ipoPageId: pageId, ipoTranslationId: translationModel.itId, ipoInstanceId: instanceId,
  });
};
