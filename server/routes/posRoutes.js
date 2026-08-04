import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getPalettesHandler, postPaletteHandler, deletePaletteHandler,
  getPosListHandler, getPosStatsHandler,
  postPosHandler, patchPosHandler, deletePosHandler,
} from '../controllers/posController.js';

const router = express.Router();
const SA = [verifyToken, roleCheck('super_admin')];

// ── Palettes ──────────────────────────────────────────────────────────────────
router.get(   '/admin/pos/palettes',     ...SA, asyncHandler(getPalettesHandler));
router.post(  '/admin/pos/palettes',     ...SA, asyncHandler(postPaletteHandler));
router.delete('/admin/pos/palettes/:id', ...SA, asyncHandler(deletePaletteHandler));

// ── POS Modules ───────────────────────────────────────────────────────────────
router.get(   '/admin/pos/stats', ...SA, asyncHandler(getPosStatsHandler));
router.get(   '/admin/pos',       ...SA, asyncHandler(getPosListHandler));
router.post(  '/admin/pos',       ...SA, asyncHandler(postPosHandler));
router.patch( '/admin/pos/:id',   ...SA, asyncHandler(patchPosHandler));
router.delete('/admin/pos/:id',   ...SA, asyncHandler(deletePosHandler));

export default router;
