import express from "express";
import CtAuth from "./ctAuth";
import { utIsAuthMW } from "../shared/utils/utAuth";

const authRouter = express.Router();

authRouter.post("/login", CtAuth.login);
authRouter.get("/logout", CtAuth.logout);
authRouter.get("/user-session", utIsAuthMW, CtAuth.getSession);

export default authRouter;
