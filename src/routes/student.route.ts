import { Router } from "express";
import StudentController from "../controllers/student.controller";

const studentRouter: Router = Router();
const studentController = new StudentController;

studentRouter.get("/getClasses", studentController.getClasses);
studentRouter.get('/getPosts', studentController.getPosts)



export default studentRouter;