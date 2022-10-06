import express from "express";
import CtExternalApi from "./ctExternalApi";

const externalApiRouter = express.Router();

externalApiRouter.post("/auth", CtExternalApi.auth);

externalApiRouter.put("/campaigns", CtExternalApi.addCampaigns);

externalApiRouter.get("/campaigns", CtExternalApi.getCampaigns);

export default externalApiRouter;
