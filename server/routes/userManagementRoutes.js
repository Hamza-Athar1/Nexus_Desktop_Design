import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getShops,
  getShopById,
  patchShopInfo,
  patchShopStatus,
  patchExtendDue,
  getShopActivity,
  postMessage,
  deleteShop,
} from '../controllers/userManagementController.js';

const router = express.Router();

// All routes require super_admin — no business scoping needed.
const SA = [verifyToken, roleCheck('super_admin')];

// NOTE: specific sub-paths registered before /:id so Express doesn't
// swallow 'activity' or 'message' as an :id value.
router.get('/admin/shops',                ...SA, asyncHandler(getShops));
router.get('/admin/shops/:id',            ...SA, asyncHandler(getShopById));
router.patch('/admin/shops/:id',          ...SA, asyncHandler(patchShopInfo));
router.patch('/admin/shops/:id/status',   ...SA, asyncHandler(patchShopStatus));
router.patch('/admin/shops/:id/extend-due', ...SA, asyncHandler(patchExtendDue));
router.get('/admin/shops/:id/activity',   ...SA, asyncHandler(getShopActivity));
router.post('/admin/shops/:id/message',   ...SA, asyncHandler(postMessage));
router.delete('/admin/shops/:id',         ...SA, asyncHandler(deleteShop));

export default router;
