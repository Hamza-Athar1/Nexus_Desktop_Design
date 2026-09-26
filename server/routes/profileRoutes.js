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

import { pool } from '../config/db.js';
import { updateBusinessPalette } from '../models/businessModel.js';
import { findBusinessWithModuleByUser } from '../models/businessModel.js';
import { checkBusinessThemeOwnership } from '../models/themeEntitlementModel.js';
import { ApiError } from '../utils/ApiError.js';

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

router.patch( '/profile/theme',        ...Auth, asyncHandler(async (req, res) => {
  const { paletteId } = req.body;
  if (!paletteId) throw new ApiError(400, 'paletteId is required');
  const [pRows] = await pool.query('SELECT id FROM pos_palettes WHERE id = ? LIMIT 1', [Number(paletteId)]);
  if (!pRows[0]) throw new ApiError(404, 'Palette not found');
  const business = await findBusinessWithModuleByUser(req.user.id);
  if (!business) throw new ApiError(404, 'No business associated with user');

  const isOwned = await checkBusinessThemeOwnership(business.id, Number(paletteId));
  if (!isOwned) {
    throw new ApiError(403, 'This theme has not been purchased for your shop.');
  }

  await updateBusinessPalette(business.id, Number(paletteId));
  res.json({ ok: true, message: 'Theme updated successfully' });
}));
router.get(   '/profile/sessions',     ...Auth, asyncHandler(getSessionsHandler));
router.delete('/profile/sessions',     ...Auth, asyncHandler(logoutAllHandler));
router.delete('/profile/account',      ...Auth, asyncHandler(deleteAccountHandler));

export default router;
