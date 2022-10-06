import express from "express";
import CtDomainDetails from "./domain/ctDomainDetails";
import CtGroupDetails from "./group/ctGroupDetails";
import { utIsAuthMW } from "../shared/utils/utAuth";
import domainVldMw from "./domain/domainVldMw";
import mwGroupVld from "./group/mwGroupVld";
import CtCompanyDetails from "./company/ctCompanyDetails";

const entitiesRouter = express.Router();

entitiesRouter.post("/domains", utIsAuthMW, domainVldMw, CtDomainDetails.addDomain);
entitiesRouter.get("/domains", utIsAuthMW, CtDomainDetails.getAllDomains);
entitiesRouter.get("/domains/:domainId", CtDomainDetails.getDomainDetails);
entitiesRouter.put("/domains/:domainId", utIsAuthMW, domainVldMw, CtDomainDetails.updateDomain);
entitiesRouter.delete("/domains/:domainId", utIsAuthMW, CtDomainDetails.deleteDomain);
entitiesRouter.delete("/domains", utIsAuthMW, CtDomainDetails.deleteDomains);
entitiesRouter.get("/domains/document/:documentType", utIsAuthMW, CtDomainDetails.generateDocument);

entitiesRouter.post("/groups", utIsAuthMW, mwGroupVld, CtGroupDetails.addGroup);
entitiesRouter.post("/groups/all", utIsAuthMW, CtGroupDetails.getAllGroups);
entitiesRouter.get("/groups/:groupId", CtGroupDetails.getGroupDetails);
entitiesRouter.put("/groups/:groupId", utIsAuthMW, mwGroupVld, CtGroupDetails.updateGroup);
entitiesRouter.delete("/groups/:groupId", utIsAuthMW, CtGroupDetails.deleteGroup);
entitiesRouter.delete("/groups", utIsAuthMW, CtGroupDetails.deleteGroups);
entitiesRouter.get("/groups-domains", utIsAuthMW, CtGroupDetails.getAllAssignedDomains);
entitiesRouter.get("/groups/document/:documentType", utIsAuthMW, CtGroupDetails.generateDocument);

entitiesRouter.post("/companies", utIsAuthMW, CtCompanyDetails.getAllCompanies);

export default entitiesRouter;
