import { Router } from "express";
import authRouter from "./auth.route";
import adminRouter from "./admin.route";
import authRole from "../midllewares/auth.middleware";

const router: Router = Router();

router.use("/auth", authRouter);
router.use(
  "/admin",
  (req, res, next) => authRole(req, res, next, "admin"),
  adminRouter
);

export default router;
