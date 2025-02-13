import { Router } from 'express';
import { login, register } from '../controllers/user/index.js';
import catchAsync from '../utils/catchAsync.js';
import errorHandler from '../middleware/errorHandler.js';

const router = Router()

router.post('/api/register', catchAsync(register))
router.post('/api/login', catchAsync(login))
router.use(errorHandler)

export default router