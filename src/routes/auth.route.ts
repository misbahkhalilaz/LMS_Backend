import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const authRouter: Router = Router();
const authController = new AuthController();

authRouter.post("/login", authController.login);
authRouter.post("/forgetPassword", authController.forgetPassword);
authRouter.post("/verifyOtp", authController.verifyOtp);
authRouter.post("/resetPassword", authController.resetPassword);

export default authRouter;
