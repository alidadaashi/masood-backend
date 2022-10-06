import express from "express";
import { utIsAuthMW } from "../shared/utils/utAuth";
import CtAppNotifications from "./ctAppNotifications";

const appNotificationsRouter = express.Router();

appNotificationsRouter.get("/get-all-un-read-notifications/", utIsAuthMW, CtAppNotifications.getAllUnReadNotifications);

appNotificationsRouter.get("/get-all-notifications/", utIsAuthMW, CtAppNotifications.getAllNotifications);

appNotificationsRouter.put("/clear-all-notifications", utIsAuthMW, CtAppNotifications.clearAllNotifications);

appNotificationsRouter.put("/mark-notifications-as-viewed", utIsAuthMW, CtAppNotifications.markNotificationsAsViewed);

export default appNotificationsRouter;
