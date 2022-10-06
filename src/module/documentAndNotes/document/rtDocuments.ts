import express from "express";
import CtDocumentType from "./documentType/ctDocumentType";
import CtAttachment from "./attachment/ctAttachment";

const documentsRouter = express.Router();

documentsRouter.get("/document-types/:dntDefinedType", CtDocumentType.getAllDocumentTypes);
documentsRouter.post("/document-types/:dntDefinedType", CtDocumentType.addDocumentTypes);
documentsRouter.put("/document-types/:dntDefinedType", CtDocumentType.updateDocumentTypes);
documentsRouter.delete("/document-types", CtDocumentType.deleteDocumentTypes);

documentsRouter.post("/attachments", CtAttachment.addAttachment);

export default documentsRouter;
