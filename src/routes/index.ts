import { Router } from "express";
import authRouter from "./auth.route";
import adminRouter from "./admin.route";
import authRole from "../midllewares/auth.middleware";
import teacherRouter from './teacher.route'
import studentRouter from "./student.route";

const router: Router = Router();

router.use("/auth", authRouter);
router.use(
  "/admin",
  (req, res, next) => authRole(req, res, next, "admin"),
  adminRouter
);
router.use(
  "/teacher",
  (req, res, next) => authRole(req, res, next, "teacher"),
  teacherRouter
);
router.use(
  "/student",
  (req, res, next) => authRole(req, res, next, "student"),
  studentRouter
);

export default router;
