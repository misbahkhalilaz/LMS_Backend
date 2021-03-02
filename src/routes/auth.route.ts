import {Router} from 'express';
import AuthController from '../controllers/auth.controller';

const authRouter: Router = Router();
const authController = new AuthController();

authRouter.post('/login', authController.login);

export default authRouter;