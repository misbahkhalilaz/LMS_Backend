import { Router } from "express";
import TeacherController from "../controllers/teacher.controller";

const teacherRouter: Router = Router();
const teacherController = new TeacherController;

teacherRouter.get('/getClasses', teacherController.getClasses)



export default teacherRouter;