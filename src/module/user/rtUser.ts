import express from "express";
import CtUser from "./ctUser";
import { utIsAuthMW } from "../shared/utils/utAuth";
import { userUpdateVldMW, mwUserVld } from "./mwUserVld";
import CtUserSelectedInstance from "./userSelectedInstance/ctUserSelectedInstance";

const usersRouter = express.Router();

usersRouter.post("/:entityId?", utIsAuthMW, mwUserVld, CtUser.addUser);
usersRouter.get("/", utIsAuthMW, CtUser.getAllUsers);
usersRouter.put("/:userId", utIsAuthMW, userUpdateVldMW, CtUser.updateUser);
usersRouter.delete("/:userId", utIsAuthMW, CtUser.deleteUser);
usersRouter.delete("/", utIsAuthMW, CtUser.deleteUsers);
usersRouter.get("/entity-users/:entityType/:entityId", utIsAuthMW, CtUser.getAllEntityUsers);

usersRouter.put("/profile/:userId", CtUser.updateUserProfile);
usersRouter.get("/document/:entityType/:entityId/:documentType", utIsAuthMW, CtUser.generateDocumentForEntityUser);
usersRouter.get("/document/:documentType", utIsAuthMW, CtUser.generateDocument);

usersRouter.get("/instances", utIsAuthMW, CtUser.getUserInstances);

usersRouter.get("/user-selected-instance", utIsAuthMW, CtUserSelectedInstance.getUserSelectedInstance);
usersRouter.put("/user-selected-instance/:selectedInstanceIds", utIsAuthMW,
  CtUserSelectedInstance.updateUserSelectedInstance);

export default usersRouter;
