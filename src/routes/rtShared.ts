import express from "express";
import multer from "multer";
import CtNetworkTime from "../module/shared/module/networkTime/ctNetworkTime";
import CtFile from "../module/shared/module/files/ctFile";

const sharedRouter = express.Router();

sharedRouter.post("/entity-files/:entityId", multer()
  .single("picture"), CtFile.addFile);
sharedRouter.put("/entity-files/:fileId", multer()
  .single("picture"), CtFile.updateFile);
sharedRouter.get("/entity-files/:fType/:entityId", CtFile.getFileByType);
sharedRouter.get("/shared-files/:fType", CtFile.getSharedFileByType);

sharedRouter.post("/files/:entityId/:fType", multer()
  .array("files"), CtFile.addFiles);
sharedRouter.get("/files/:fId", CtFile.getFileById);
sharedRouter.get("/files/user-files/:uEntityId", CtFile.getUserFiles);

sharedRouter.get("/network-time", CtNetworkTime.getNetworkTime);

export default sharedRouter;
