import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getInvoices,
  getStats,
  getInvoiceDetail,
  postInitiateInvoice,
  getPayments,
  getModuleStats,
} from '../controllers/billingController.js';

const router = express.Router();
const SA = [verifyToken, roleCheck('super_admin')];

// ── Billing page ──────────────────────────────────────────────────────────────
// IMPORTANT: /stats before /:id so "stats" is never treated as a numeric ID.
router.get( '/admin/billing/stats',    ...SA, asyncHandler(getStats));
router.get( '/admin/billing',          ...SA, asyncHandler(getInvoices));
router.get( '/admin/billing/:id',      ...SA, asyncHandler(getInvoiceDetail));
router.post('/admin/billing/initiate', ...SA, asyncHandler(postInitiateInvoice));

// ── Payment page ──────────────────────────────────────────────────────────────
router.get('/admin/payment/stats', ...SA, asyncHandler(getModuleStats));
router.get('/admin/payment',       ...SA, asyncHandler(getPayments));

export default router;
