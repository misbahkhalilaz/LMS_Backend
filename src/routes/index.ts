import {Router} from 'express';
import authRouter from './auth.route';
import adminRouter from './admin.route'


const router : Router = Router();

router.use('/auth', authRouter);
router.use('/admin', adminRouter);

export default router;