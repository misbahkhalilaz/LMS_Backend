import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import UploadFile from "../utils/uploadFile";

const adminRouter: Router = Router();
const adminController = new AdminController();
const uploader = new UploadFile();

adminRouter.post(
  "/createAccounts",
  uploader.upload.single("students"),
  adminController.createStdAccounts
);
adminRouter.post(
  "/createTeacherAccount",
  adminController.createTeacherAccounts
);

export default adminRouter;
