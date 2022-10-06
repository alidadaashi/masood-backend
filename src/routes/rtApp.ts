import express from "express";
import privilegesRouter from "../module/privilege/rtprivileges";
import usersRouter from "../module/user/rtUser";
import entitiesRouter from "../module/entities/rtEntities";
import authRouter from "../module/auth/rtAuth";
import PreferencesRouter from "../module/preferences/rtPreferences";
import sharedRouter from "./rtShared";
import i18nRouter from "../module/i18n/rtI18n";
import productsRouter from "../module/product/rtProduct";
import vediRouter from "../vedi/module/rtVedi";
import campaignRouter from "../module/campaign/rtCampaign";
import adminRouter from "../module/admin/rtAdmin";
import externalApiRouter from "../module/externalApi/rtExternalApi";
import documentsRouter from "../module/documentAndNotes/document/rtDocuments";
import appNotificationsRouter from "../module/appNotifications/rtAppNotifications";
import notesRouter from "../module/documentAndNotes/notes/rtNotes";
import stickyNotesRouter from "../module/stickyNotes/rtStickyNotes";

const appRouter = express.Router();

appRouter.use("/i18n", i18nRouter);
appRouter.use("/privileges", privilegesRouter);
appRouter.use("/admin", adminRouter);
appRouter.use("/users", usersRouter);
appRouter.use("/entities", entitiesRouter);
appRouter.use("/preference", PreferencesRouter);
appRouter.use("/auth", authRouter);
appRouter.use("/shared", sharedRouter);
appRouter.use("/products", productsRouter);
appRouter.use("/campaigns", campaignRouter);
appRouter.use("/vedi", vediRouter);
appRouter.use("/external", externalApiRouter);
appRouter.use("/documents", documentsRouter);
appRouter.use("/appNotification", appNotificationsRouter);
appRouter.use("/notes", notesRouter);
appRouter.use("/stickyNotes", stickyNotesRouter);

appRouter.get("/testing", (_req, res) => res
  .end("Welcome to nodeJs App"));

export default appRouter;
