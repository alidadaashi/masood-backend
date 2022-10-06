import express from "express";
import CtProduct from "./ctProduct";
import { utIsAuthMW } from "../shared/utils/utAuth";

const productRouter = express.Router();

productRouter.post("/", utIsAuthMW, CtProduct.addProduct);
productRouter.get("/", utIsAuthMW, CtProduct.getAllProducts);

export default productRouter;
