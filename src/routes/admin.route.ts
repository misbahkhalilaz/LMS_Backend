import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import UploadFile from "../utils/uploadFile";

const adminRouter: Router = Router();
const adminController = new AdminController();
const uploader = new UploadFile(3);

adminRouter.post(
  "/createTeacherAccount",
  adminController.createTeacherAccounts
);
adminRouter.post("/createProgram", adminController.createProgram);
adminRouter.post("/createCourse", adminController.createCourse);
adminRouter.post(
  "/createBatch",
  uploader.upload.any(),
  adminController.createBatch
);
adminRouter.post("/createClass", adminController.createClass);
adminRouter.get("/getProgramData", adminController.getProgramData);
adminRouter.get("/getUsers", adminController.getUsers);
adminRouter.post("/toggleUserInactive", adminController.toggleUserInactive)
adminRouter.get("/getProgramsWithDetails", adminController.getProgramsWithDetails)

export default adminRouter;
