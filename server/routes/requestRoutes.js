import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireBusiness } from '../middleware/requireBusiness.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  postRequest,
  getMyRequests,
  getRequests,
  getRequestsMeta,
  getRequestById,
  patchRequestStatus,
} from '../controllers/shopRequestController.js';

const router = express.Router();

// ── Business-side: file / view your own business's requests ────────────
router.post('/requests', verifyToken, requireBusiness, asyncHandler(postRequest));
router.get('/requests/mine', verifyToken, requireBusiness, asyncHandler(getMyRequests));

// ── Super admin-side: platform-wide review workflow ─────────────────────
// NOTE: /meta is registered before /:id so "meta" doesn't get swallowed
// by the :id param.
router.get('/admin/requests/meta', verifyToken, roleCheck('super_admin'), asyncHandler(getRequestsMeta));
router.get('/admin/requests/:id', verifyToken, roleCheck('super_admin'), asyncHandler(getRequestById));
router.get('/admin/requests', verifyToken, roleCheck('super_admin'), asyncHandler(getRequests));
router.patch('/admin/requests/:id', verifyToken, roleCheck('super_admin'), asyncHandler(patchRequestStatus));

export default router;
