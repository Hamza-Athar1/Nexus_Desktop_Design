import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { requireBusiness } from '../middleware/requireBusiness.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  postCheckout,
  getSales,
  getSaleDetail,
  postReturn,
} from '../controllers/salesController.js';

const router = express.Router();

// Sales & Checkout routes require authentication, tenant business scoping, and admin or user (cashier) role
const authSales = [
  verifyToken,
  requireBusiness,
  roleCheck('admin', 'user', 'super_admin'),
];

router.post('/sales', authSales, asyncHandler(postCheckout));
router.get('/sales', authSales, asyncHandler(getSales));
router.get('/sales/:id', authSales, asyncHandler(getSaleDetail));
router.post('/sales/returns', authSales, asyncHandler(postReturn));

export default router;
