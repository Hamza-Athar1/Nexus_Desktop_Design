import express from 'express';
import {
  getModules,
  getBusinessTypes,
  getPlans,
  getBackupModules,
} from '../controllers/catalogController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import { listPalettes } from '../models/posModel.js';

const router = express.Router();

// Public — this is seeded reference data (business modules, plans, etc.),
// not tenant data. The registration wizard needs it before a business
// (or in the frontend's current form, sometimes even before login) exists.
router.get('/modules', asyncHandler(getModules));
router.get('/business-types', asyncHandler(getBusinessTypes));
router.get('/plans', asyncHandler(getPlans));
router.get('/backup-modules', asyncHandler(getBackupModules));
router.get('/palettes', asyncHandler(async (req, res) => {
  const palettes = await listPalettes();
  res.json({ ok: true, palettes });
}));

export default router;
