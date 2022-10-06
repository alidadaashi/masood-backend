import express from "express";
import multer from "multer";
import CtI18n from "./i18n/ctI18n";
import CtLanguages from "./languages/ctLanguages";
import { utIsAuthMW, utIsGroupAdmin } from "../shared/utils/utAuth";
import { utReadI18nUploadFile } from "./i18n/utI18n";
import CtMultiInstanceI18n from "../i18nMultiInstance/multiInstI18n/ctMultiInstI18n";

const i18nRouter = express.Router();

i18nRouter.get("/languages", CtLanguages.getAllLanguages);
i18nRouter.put("/languages", utIsAuthMW, utIsGroupAdmin, CtLanguages.updateLanguages);
i18nRouter.post("/languages", utIsAuthMW, utIsGroupAdmin, CtLanguages.addLanguage);

i18nRouter.get("/translations/:transType?", utIsAuthMW, utIsGroupAdmin, CtI18n.getAllTranslations);
i18nRouter.put("/translations", utIsAuthMW, utIsGroupAdmin, CtI18n.updateTranslations);

i18nRouter.put("/all-instance-translations", utIsAuthMW, utIsGroupAdmin, CtMultiInstanceI18n.updateTranslations);

i18nRouter.get("/all-instance-translations/:transType?", utIsAuthMW, utIsGroupAdmin, CtMultiInstanceI18n.getAllTranslations);
i18nRouter.get("/instances-multi-implementations/:slugId",
  utIsAuthMW, utIsGroupAdmin, CtMultiInstanceI18n.getInstancesMultiImplementations);

i18nRouter
  .get("/dynamic-translations/:slugId", utIsAuthMW, utIsGroupAdmin, CtI18n.getDynamicTranslationsForSlug);
i18nRouter.put("/dynamic-translations/:slugId", utIsAuthMW, utIsGroupAdmin, CtI18n.updateDynamicTranslationsForSlug);

i18nRouter.put("/multiple-implementations/:slugId", utIsAuthMW, utIsGroupAdmin, CtI18n.updateTranslationsMultipleImp);

i18nRouter.put("/all-instance-multiple-implementations/:slugId",
  utIsAuthMW, utIsGroupAdmin, CtMultiInstanceI18n.updateTranslationsInstancesMultipleImp);

i18nRouter
  .get("/multiple-implementations/:slugId", utIsAuthMW, utIsGroupAdmin, CtI18n.getMultipleImplementations);

i18nRouter.get("/screen-text/:lang?", CtI18n.getScreenTexts);

i18nRouter.put("/i18n-upload-file", multer().single("file"),
  utIsAuthMW, utIsGroupAdmin, utReadI18nUploadFile, CtI18n.handleSaveI18nTranslations);

i18nRouter.put("/all-instance-i18n-upload-file", multer().single("file"),
  utIsAuthMW, utIsGroupAdmin, utReadI18nUploadFile, CtMultiInstanceI18n.handleSaveMultiInstanceI18nTranslations);

export default i18nRouter;
