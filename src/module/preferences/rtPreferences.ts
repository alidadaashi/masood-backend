import express from "express";
import CtUserPageLayoutPreference from "./userPageLayoutPreference/ctUserPageLayoutPreference";
import CtUserPageQueryPreference from "./userPageQueryPreference/ctUserPageQueryPreference";
import { utIsAuthMW } from "../shared/utils/utAuth";
import CtUserPagePreference from "./userPagePreference/ctUserPagePreference";
import CtUserUxPreference from "./userUxPreference/ctUserUxPreference";
import CtUserPreferences from "./userPreference/ctUserPreferences";
import CtInstanceDisableDates from "./instanceDisableDate/ctInstanceDisableDate";

const PreferencesRouter = express.Router();

PreferencesRouter.get("/page-preference/:pageKey", utIsAuthMW, CtUserPagePreference.getPagePreference);
PreferencesRouter.put("/page-preference/:id", utIsAuthMW, CtUserPagePreference.updatePagePreference);

PreferencesRouter.post("/page-query-preference/:pageKey", utIsAuthMW, CtUserPageQueryPreference.addPageQueryPreference);
PreferencesRouter.get("/page-query-preferences/:pageKey", utIsAuthMW, CtUserPageQueryPreference.getPageQueryPreferences);
PreferencesRouter.get("/page-query-preference/:id", utIsAuthMW, CtUserPageQueryPreference.getPageQueryPreferenceDetails);
PreferencesRouter.put("/page-query-preference/:id", utIsAuthMW, CtUserPageQueryPreference.updatePageQueryPreference);
PreferencesRouter.delete("/page-query-preference/:id", utIsAuthMW, CtUserPageQueryPreference.deletePageQueryPreference);
PreferencesRouter.get("/page-query-preference/favorite/:pageKey",
  utIsAuthMW,
  CtUserPageQueryPreference.getFavoritePageQueryPreferenceDetails);

PreferencesRouter.post("/page-layout-preference/:pageKey", utIsAuthMW, CtUserPageLayoutPreference.addPageLayoutPreference);
PreferencesRouter.get("/page-layout-preferences/:pageKey", utIsAuthMW, CtUserPageLayoutPreference.getPageLayoutPreferences);
PreferencesRouter.get("/page-layout-preference/:id", utIsAuthMW, CtUserPageLayoutPreference.getPageLayoutPreferenceDetails);
PreferencesRouter.put("/page-layout-preference/:id", utIsAuthMW, CtUserPageLayoutPreference.updatePageLayoutPreference);
PreferencesRouter.delete("/page-layout-preference/:id", utIsAuthMW, CtUserPageLayoutPreference.deletePageLayoutPreference);
PreferencesRouter.get("/page-layout-preference/favorite/:pageKey",
  utIsAuthMW,
  CtUserPageLayoutPreference.getFavoritePageLayoutPreferenceDetails);

PreferencesRouter.get("/ux-prefs/", CtUserUxPreference.getUserUxPreferences);
PreferencesRouter.get("/ux-prefs/:preferenceKey", CtUserUxPreference.getUserUxPreferenceByType);
PreferencesRouter.put("/ux-prefs/:preferenceKey", utIsAuthMW, CtUserUxPreference.updateUserUxPreference);

PreferencesRouter.get("/user-preferences/", CtUserPreferences.getUserPreferences);
PreferencesRouter.get("/user-preferences/:preferenceKey", CtUserPreferences.getUserPreferenceByType);
PreferencesRouter.put("/user-preferences/", utIsAuthMW, CtUserPreferences.updateUserPreferences);

PreferencesRouter.put("/instance/disable-dates", utIsAuthMW, CtInstanceDisableDates.updateInstanceDisableDates);
PreferencesRouter.get("/instance/disable-dates", utIsAuthMW, CtInstanceDisableDates.getInstanceDisableDates);

export default PreferencesRouter;
