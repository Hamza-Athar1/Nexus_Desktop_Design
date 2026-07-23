import express from 'express';
import {
  signup,
  login,
  getMe,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.get('/me', verifyToken, asyncHandler(getMe));
router.post('/logout', asyncHandler(logout));
router.post('/refresh', asyncHandler(refresh));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));

export default router;
