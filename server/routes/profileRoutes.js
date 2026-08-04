import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getProfileHandler,
  updateProfileHandler,
  updateEmailHandler,
  changePasswordHandler,
  toggle2faHandler,
  updatePreferencesHandler,
  getSessionsHandler,
  logoutAllHandler,
  deleteAccountHandler,
} from '../controllers/profileController.js';

const router = express.Router();
// All profile routes require a valid session — no role restriction
// (any logged-in user manages their own profile).
const Auth = [verifyToken];

router.get(   '/profile/me',           ...Auth, asyncHandler(getProfileHandler));
router.patch( '/profile/me',           ...Auth, asyncHandler(updateProfileHandler));
router.patch( '/profile/email',        ...Auth, asyncHandler(updateEmailHandler));
router.post(  '/profile/password',     ...Auth, asyncHandler(changePasswordHandler));
router.patch( '/profile/2fa',          ...Auth, asyncHandler(toggle2faHandler));
router.patch( '/profile/preferences',  ...Auth, asyncHandler(updatePreferencesHandler));
router.get(   '/profile/sessions',     ...Auth, asyncHandler(getSessionsHandler));
router.delete('/profile/sessions',     ...Auth, asyncHandler(logoutAllHandler));
router.delete('/profile/account',      ...Auth, asyncHandler(deleteAccountHandler));

export default router;
