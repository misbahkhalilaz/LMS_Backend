import { Router } from "express";
import TeacherController from "../controllers/teacher.controller";
import UploadFile from "../utils/uploadFile";

const teacherRouter: Router = Router();
const teacherController = new TeacherController;
const uploader = new UploadFile(4, '*', 2 * 1024 * 1024);


teacherRouter.get('/getClasses', teacherController.getClasses)
teacherRouter.post("/createPost", uploader.upload.any(), teacherController.createPost);



export default teacherRouter;