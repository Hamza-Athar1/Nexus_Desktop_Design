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
import { getReceiptSettingsByBusiness, upsertReceiptSettings } from '../models/receiptSettingsModel.js';
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

router.get('/business/receipt-settings', ...Auth, asyncHandler(async (req, res) => {
  const business = await findBusinessWithModuleByUser(req.user.id);
  if (!business) throw new ApiError(404, 'No business associated with user');
  const settings = await getReceiptSettingsByBusiness(business.id);
  res.json({ ok: true, settings });
}));

router.patch('/business/receipt-settings', ...Auth, asyncHandler(async (req, res) => {
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    throw new ApiError(403, 'Only business administrators can modify receipt settings.');
  }

  const business = await findBusinessWithModuleByUser(req.user.id);
  if (!business) throw new ApiError(404, 'No business associated with user');

  const { shopName, shopAddress, fontSize, language, logoUrl } = req.body;

  if (shopName !== undefined && (!shopName.trim() || shopName.length > 150)) {
    throw new ApiError(400, 'shopName must be between 1 and 150 characters');
  }

  if (shopAddress !== undefined && shopAddress && shopAddress.length > 500) {
    throw new ApiError(400, 'shopAddress cannot exceed 500 characters');
  }

  const numFontSize = fontSize !== undefined ? Number(fontSize) : undefined;
  if (numFontSize !== undefined && (isNaN(numFontSize) || numFontSize < 10 || numFontSize > 50)) {
    throw new ApiError(400, 'fontSize must be a number between 10 and 50');
  }

  if (language !== undefined && !['en', 'ur'].includes(language)) {
    throw new ApiError(400, 'language must be either "en" or "ur"');
  }

  const current = await getReceiptSettingsByBusiness(business.id);

  const updatedSettings = await upsertReceiptSettings(business.id, {
    shopName: shopName !== undefined ? shopName.trim() : current.shopName,
    shopAddress: shopAddress !== undefined ? (shopAddress ? shopAddress.trim() : null) : current.shopAddress,
    fontSize: numFontSize !== undefined ? numFontSize : current.fontSize,
    language: language !== undefined ? language : current.language,
    logoUrl: logoUrl !== undefined ? logoUrl : current.logoUrl,
  });

  res.json({ ok: true, message: 'Receipt settings saved successfully', settings: updatedSettings });
}));
router.get(   '/profile/sessions',     ...Auth, asyncHandler(getSessionsHandler));
router.delete('/profile/sessions',     ...Auth, asyncHandler(logoutAllHandler));
router.delete('/profile/account',      ...Auth, asyncHandler(deleteAccountHandler));

export default router;
