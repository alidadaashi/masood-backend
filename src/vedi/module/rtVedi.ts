import express from "express";
import CtSuppliers from "./suppliers/ctSuppliers";
import utIsAuthOldAppMW from "../utils/utAuth";

const vediRouter = express.Router();

vediRouter.get("/suppliers", utIsAuthOldAppMW, CtSuppliers.getAllVendorSuppliers);
vediRouter.get("/suppliers/document/:documentType", utIsAuthOldAppMW, CtSuppliers.generateDocument);

export default vediRouter;
