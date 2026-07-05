import express from 'express';
import { signup, login, getMe, logout, refresh } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.post('/logout', logout);
router.post('/refresh', refresh);

export default router;