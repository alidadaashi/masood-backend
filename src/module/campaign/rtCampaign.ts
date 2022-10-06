import express from "express";
import multer from "multer";
import CtCampaign from "./ctCampaign";
import { utIsAuthMW } from "../shared/utils/utAuth";
import { utReadCampaignDetails } from "./utCampaign";
import CtCampaignFieldResp from "./campaignFieldResp/ctCampaignFieldResp";

const campaignRouter = express.Router();

campaignRouter.get("/", utIsAuthMW, CtCampaign.getAllCampaigns);
campaignRouter.get("/supplier-campaigns", utIsAuthMW, CtCampaign.getAllCampaignsForSupplier);
campaignRouter.get("/summary", utIsAuthMW, CtCampaign.getCampaignsSummary);

campaignRouter.post(
  "/supplier-response/:campaignSupplierId",
  multer().single("file"),
  utReadCampaignDetails,
  CtCampaignFieldResp.saveCampaignItemsResponseForSupplier,
);

campaignRouter.post(
  "/response/:campaignSupplierId",
  multer().single("file"),
  utReadCampaignDetails,
  CtCampaignFieldResp.saveCampaignItemsResponse,
);

campaignRouter.post("/:campaignSupplierId", utIsAuthMW, CtCampaign.getCampaignDetails);
campaignRouter.post("/supplier-campaigns-details/:campaignSupplierId", utIsAuthMW, CtCampaign.getCampaignDetailsForSupplier);

campaignRouter.put("/status", utIsAuthMW, CtCampaign.updateCampaignsStatus);

campaignRouter.get("/create/:instanceId", CtCampaign.tempCreateCampaign);

export default campaignRouter;
