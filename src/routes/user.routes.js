import { Router } from 'express';
import { login, refreshAccessToken, register } from '../controllers/user/index.js';

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/auth/refresh', refreshAccessToken);

export default router

