import {Router} from 'express';
import AuthController from '../controllers/auth.controller';

const authRouter: Router = Router();
const authController = new AuthController();

authRouter.post('/login', authController.login);
authRouter.post('/resetPassword', authController.resetPassword);

export default authRouter;